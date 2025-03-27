import { cookies } from 'next/headers';
import { db } from './db';

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
      return { authenticated: false };
    }
    
    // Dans un cas réel, vous utiliseriez bcrypt pour comparer les mots de passe hachés
    // Exemple: const isValid = await bcrypt.compare(password, user.password);
    
    // Pour cet exemple, nous faisons une comparaison simple
    // ATTENTION: En production, utilisez toujours bcrypt ou argon2 pour les mots de passe
    const isValid = user.password === password;
    
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