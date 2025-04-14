import { createPageUrl } from "@/lib/utils";

describe("createPageUrl", () => {
  it("doit générer une URL avec juste le numéro de page", () => {
    expect(createPageUrl(5)).toBe("/?page=5");
  });

  it("doit ajouter des paramètres de recherche si fournis", () => {
    const params = { search: "test" };
    expect(createPageUrl(2, params)).toBe("/?page=2&search=test");
  });

  it("doit gérer plusieurs paramètres de recherche", () => {
    const params = {
      search: "test",
      pricing: "FREE",
      categories: "cat1,cat2",
      tags: "tag1,tag2"
    };
    
    expect(createPageUrl(3, params)).toBe(
      "/?page=3&search=test&pricing=FREE&categories=cat1%2Ccat2&tags=tag1%2Ctag2"
    );
  });

  it("doit gérer les paramètres vides ou manquants", () => {
    const params = {
      search: "",
      pricing: null,
      categories: undefined
    };
    
    expect(createPageUrl(1, params)).toBe("/?page=1");
  });

  it("doit gérer les caractères spéciaux dans les paramètres", () => {
    const params = {
      search: "test & query?",
    };
    
    // Les caractères spéciaux sont encodés via URLSearchParams
    expect(createPageUrl(1, params)).toBe("/?page=1&search=test+%26+query%3F");
  });
}); 