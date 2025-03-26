import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function ContactPage() {
  return (
    <>
      {/* En-tête de la page */}
      <section className="bg-gradient-to-b from-primary-50 to-background py-12">
        <div className="container px-4 mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 animate-fade-in">
              Contactez-nous
            </h1>
            <p className="text-lg text-muted-foreground mb-6 animate-fade-in">
              Pour toute question, suggestion d'outil ou retour sur notre plateforme
            </p>
          </div>
        </div>
      </section>
      
      <section className="py-12">
        <div className="container px-4 mx-auto">
          <div className="max-w-3xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Formulaire de contact</CardTitle>
                <CardDescription>
                  Remplissez ce formulaire pour nous envoyer un message. Nous vous répondrons dans les plus brefs délais.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nom</Label>
                      <Input id="name" placeholder="Votre nom" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="votre@email.com" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="subject">Sujet</Label>
                    <Input id="subject" placeholder="Sujet de votre message" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea id="message" placeholder="Votre message..." rows={6} />
                  </div>
                </form>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" asChild>
                  <Link href="/">Annuler</Link>
                </Button>
                <Button>Envoyer</Button>
              </CardFooter>
            </Card>
            
            <div className="mt-16">
              <h2 className="text-2xl font-bold mb-6">Autres façons de nous contacter</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center">
                      <div className="bg-primary/10 p-3 rounded-full mb-4">
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          className="w-6 h-6 text-primary"
                        >
                          <rect width="20" height="16" x="2" y="4" rx="2" />
                          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium mb-2">Email</h3>
                      <p className="text-muted-foreground mb-2">
                        Envoyez-nous un email directement
                      </p>
                      <a 
                        href="mailto:contact@video-ia.net" 
                        className="text-primary hover:underline"
                      >
                        contact@video-ia.net
                      </a>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center">
                      <div className="bg-primary/10 p-3 rounded-full mb-4">
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          className="w-6 h-6 text-primary"
                        >
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium mb-2">Téléphone</h3>
                      <p className="text-muted-foreground mb-2">
                        Appelez-nous pour une assistance rapide
                      </p>
                      <a 
                        href="tel:+33123456789" 
                        className="text-primary hover:underline"
                      >
                        +33 1 23 45 67 89
                      </a>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center">
                      <div className="bg-primary/10 p-3 rounded-full mb-4">
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          className="w-6 h-6 text-primary"
                        >
                          <path d="M15 10a5 5 0 0 0-13 0v0a5 5 0 0 0 5 5h5a7 7 0 0 0 7-7v0a7 7 0 0 0-7-7H6" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium mb-2">Réseaux sociaux</h3>
                      <p className="text-muted-foreground mb-2">
                        Suivez-nous sur les réseaux sociaux
                      </p>
                      <div className="flex space-x-3">
                        <a href="#" className="text-primary hover:text-primary/80">
                          Twitter
                        </a>
                        <a href="#" className="text-primary hover:text-primary/80">
                          LinkedIn
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
} 