import { safeJsonParse } from "@/lib/utils";

describe("safeJsonParse", () => {
  it("doit parser correctement un JSON valide", () => {
    const jsonString = '["test1", "test2", "test3"]';
    expect(safeJsonParse(jsonString)).toEqual(["test1", "test2", "test3"]);
  });

  it("doit parser correctement un JSON d'objets", () => {
    const jsonString = '[{"id": 1, "name": "Test1"}, {"id": 2, "name": "Test2"}]';
    expect(safeJsonParse(jsonString)).toEqual([
      { id: 1, name: "Test1" },
      { id: 2, name: "Test2" }
    ]);
  });

  it("doit retourner un tableau vide pour une chaîne null", () => {
    expect(safeJsonParse(null)).toEqual([]);
  });

  it("doit retourner un tableau vide pour une chaîne undefined", () => {
    expect(safeJsonParse(undefined)).toEqual([]);
  });

  it("doit retourner un tableau vide pour une chaîne vide", () => {
    expect(safeJsonParse("")).toEqual([]);
  });

  it("doit convertir une chaîne simple en tableau en cas d'échec du parsing JSON", () => {
    const invalidJson = "test1, test2, test3";
    expect(safeJsonParse(invalidJson)).toEqual(["test1", "test2", "test3"]);
  });

  it("doit trimmer les éléments lors de la séparation par virgule", () => {
    const invalidJson = "test1, test2 , test3";
    expect(safeJsonParse(invalidJson)).toEqual(["test1", "test2", "test3"]);
  });

  it("doit filtrer les éléments vides lors de la séparation par virgule", () => {
    const invalidJson = "test1,, test2 ,";
    expect(safeJsonParse(invalidJson)).toEqual(["test1", "test2"]);
  });
}); 