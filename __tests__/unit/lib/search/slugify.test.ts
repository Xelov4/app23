import { slugify } from "@/lib/utils";

describe("slugify", () => {
  it("doit convertir le texte en minuscules", () => {
    expect(slugify("TEST")).toBe("test");
  });

  it("doit remplacer les espaces par des tirets", () => {
    expect(slugify("test de fonction")).toBe("test-de-fonction");
  });

  it("doit supprimer les accents", () => {
    expect(slugify("téléchargement")).toBe("telechargement");
  });

  it("doit supprimer les caractères spéciaux", () => {
    expect(slugify("test@123!")).toBe("test123");
  });

  it("doit supprimer les espaces en début et fin de chaîne", () => {
    expect(slugify(" test ")).toBe("test");
  });

  it("doit remplacer les tirets multiples par un seul", () => {
    expect(slugify("test--de---fonction")).toBe("test-de-fonction");
  });

  it("doit gérer les caractères accentués et spéciaux", () => {
    expect(slugify("L'éducation & la formation")).toBe("leducation-la-formation");
  });

  it("doit gérer un texte complexe", () => {
    const texte = "Génération de vidéo (HD & 4K) - Test #123";
    expect(slugify(texte)).toBe("generation-de-video-hd-4k-test-123");
  });

  it("doit retourner une chaîne vide si l'entrée est vide", () => {
    expect(slugify("")).toBe("");
  });
}); 