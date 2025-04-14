import { generatePaginationItems } from "@/lib/utils";

describe("generatePaginationItems", () => {
  it("doit retourner [1] pour 1 page au total", () => {
    expect(generatePaginationItems(1, 1)).toEqual([1]);
  });

  it("doit retourner [1, 2] pour 2 pages au total", () => {
    expect(generatePaginationItems(1, 2)).toEqual([1, 2]);
  });

  it("doit retourner [1, 2, 3] pour 3 pages au total", () => {
    expect(generatePaginationItems(1, 3)).toEqual([1, 2, 3]);
  });

  it("doit afficher les points de suspension pour plusieurs pages", () => {
    expect(generatePaginationItems(5, 10)).toEqual([1, '...', 4, 5, 6, '...', 10]);
  });

  it("doit afficher les points de suspension au début pour page actuelle proche de la fin", () => {
    expect(generatePaginationItems(9, 10)).toEqual([1, '...', 8, 9, 10]);
  });

  it("doit afficher les points de suspension à la fin pour page actuelle proche du début", () => {
    expect(generatePaginationItems(2, 10)).toEqual([1, 2, 3, '...', 10]);
  });

  it("doit gérer un grand nombre de pages", () => {
    expect(generatePaginationItems(50, 100)).toEqual([1, '...', 49, 50, 51, '...', 100]);
  });

  it("doit gérer le cas où la page actuelle est la première", () => {
    expect(generatePaginationItems(1, 10)).toEqual([1, 2, '...', 10]);
  });

  it("doit gérer le cas où la page actuelle est la dernière", () => {
    expect(generatePaginationItems(10, 10)).toEqual([1, '...', 9, 10]);
  });
}); 