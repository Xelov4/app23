import { formatPricingType } from "@/lib/utils";

describe("formatPricingType", () => {
  it("doit retourner 'Gratuit' pour 'FREE'", () => {
    expect(formatPricingType("FREE")).toBe("Gratuit");
  });

  it("doit retourner 'Payant' pour 'PAID'", () => {
    expect(formatPricingType("PAID")).toBe("Payant");
  });

  it("doit retourner 'Freemium' pour 'FREEMIUM'", () => {
    expect(formatPricingType("FREEMIUM")).toBe("Freemium");
  });

  it("doit retourner 'Sur demande' pour 'CONTACT'", () => {
    expect(formatPricingType("CONTACT")).toBe("Sur demande");
  });

  it("doit retourner la valeur originale pour un type non mappé", () => {
    expect(formatPricingType("CUSTOM_TYPE")).toBe("CUSTOM_TYPE");
  });

  it("doit gérer les types passés en minuscules", () => {
    // Note: Cette fonction n'a pas de logique spécifique pour les minuscules
    // donc elle renverra le type original, pas la transformation
    expect(formatPricingType("free")).toBe("free");
  });
}); 