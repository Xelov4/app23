import { cookies } from 'next/headers';
import { db } from './db';
import * as bcrypt from 'bcrypt';
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import { compare } from "bcrypt";
import { DefaultSession } from "next-auth";

// Fonction pour vérifier si un utilisateur est connecté en tant qu'admin
export async function isAdmin(): Promise<boolean> {
  try {
    // Récupérer le cookie de session
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('admin_session')?.value;
    
    if (!sessionToken) {
      return false;
    }
    
    // Vérifier la session admin en base de données
    // Note: dans un cas réel, vous pourriez avoir une table de sessions
    // Ici on suppose que vous avez un mécanisme simple basé sur un cookie encodé
    
    // Décoder le token pour récupérer l'ID utilisateur (simple exemple)
    const userId = sessionToken.split('.')[0];
    
    if (!userId) {
      return false;
    }
    
    // Vérifier si l'utilisateur existe et est un admin
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });
    
    return user?.role === 'ADMIN';
  } catch (err) {
    console.error('Erreur lors de la vérification des droits admin:', err);
    return false;
  }
}

// Fonction pour créer une session admin (utilisée lors du login)
export async function createAdminSession(userId: string): Promise<string> {
  // Générer un token simple (userId.timestamp.randomString)
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const sessionToken = `${userId}.${timestamp}.${randomString}`;
  
  // Dans un cas réel, vous stockeriez ce token en base de données
  // avec une date d'expiration
  
  return sessionToken;
}

// Fonction pour hacher un mot de passe (utilisée lors de la création d'un utilisateur)
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

// Fonction pour vérifier les identifiants de connexion
export async function verifyCredentials(
  username: string,
  password: string
): Promise<{ authenticated: boolean; userId?: string }> {
  try {
    // Rechercher l'utilisateur par son email (utilisé comme nom d'utilisateur)
    const user = await db.user.findUnique({
      where: { email: username },
      select: { id: true, password: true, role: true }
    });
    
    if (!user) {
      // Utiliser un délai aléatoire pour éviter les attaques de timing
      await new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * 200) + 100));
      return { authenticated: false };
    }
    
    // Utiliser bcrypt pour comparer les mots de passe
    let isValid = false;
    
    try {
      // Si le mot de passe est déjà haché avec bcrypt
      if (user.password.startsWith('$2b$') || user.password.startsWith('$2a$')) {
        isValid = await bcrypt.compare(password, user.password);
      } else {
        // Comparaison en texte brut (uniquement pour la migration)
        // À terme, tous les mots de passe devraient être hachés
        isValid = user.password === password;
        
        // Si connexion réussie avec un mot de passe en clair, 
        // mettre à jour vers un mot de passe haché
        if (isValid) {
          const hashedPassword = await hashPassword(password);
          await db.user.update({
            where: { id: user.id },
            data: { password: hashedPassword }
          });
          console.log(`Mot de passe haché mis à jour pour l'utilisateur: ${user.id}`);
        }
      }
    } catch (err) {
      console.error('Erreur lors de la comparaison des mots de passe:', err);
      isValid = false;
    }
    
    if (!isValid || user.role !== 'ADMIN') {
      return { authenticated: false };
    }
    
    return {
      authenticated: true,
      userId: user.id
    };
  } catch (err) {
    console.error('Erreur lors de la vérification des identifiants:', err);
    return { authenticated: false };
  }
}

// Fonction pour obtenir la session admin
export async function getAdminSession() {
  try {
    // Récupérer le cookie de session
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('admin_session')?.value;
    
    if (!sessionToken) {
      return null;
    }
    
    // Décoder le token pour récupérer l'ID utilisateur
    const userId = sessionToken.split('.')[0];
    
    if (!userId) {
      return null;
    }
    
    // Vérifier si l'utilisateur existe et est un admin
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true }
    });
    
    if (!user || user.role !== 'ADMIN') {
      return null;
    }
    
    return { userId: user.id };
  } catch (err) {
    console.error('Erreur lors de la récupération de la session admin:', err);
    return null;
  }
}

// Fonction pour effacer la session admin
export async function clearAdminSession() {
  try {
    const cookieStore = await cookies();
    
    // Supprimer le cookie de session
    cookieStore.delete('admin_session');
    
    return true;
  } catch (err) {
    console.error('Erreur lors de la suppression de la session:', err);
    return false;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        });

        if (!user) {
          return null;
        }

        const isPasswordValid = await compare(credentials.password, user.password);

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        };
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

declare module "next-auth" {
  interface User {
    role: string;
  }
  
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string;
    id: string;
  }
} 