export class Entorno {
  private variables: Map<string, { valor: any; tipo: string }> = new Map();

  constructor(private padre: Entorno | null, public nombre: string) {}

  declarar(nombre: string, valor: any, tipo: string): void {
    this.variables.set(nombre, { valor, tipo });
  }

  // Devuelve solo el valor (compatibilidad con todo el código existente)
  get(nombre: string): any {
    if (this.variables.has(nombre)) return this.variables.get(nombre)!.valor;
    if (this.padre) return this.padre.get(nombre); // ← quitado el .valor que era el bug
    throw new Error(`Variable '${nombre}' no declarada`);
  }

  getTipo(nombre: string): any {
    if (this.variables.has(nombre)) return this.variables.get(nombre)!.tipo;
    if (this.padre) return this.padre.getTipo(nombre);
    throw new Error(`Variable '${nombre}' no declarada`);
  }

  // Devuelve el objeto completo { valor, tipo }
  getSimbolo(nombre: string): { valor: any; tipo: string } | null {
    if (this.variables.has(nombre)) return this.variables.get(nombre)!;
    if (this.padre) return this.padre.getSimbolo(nombre);
    return null;
  }

  set(nombre: string, valor: any): void {
    if (this.variables.has(nombre)) {
      const actual = this.variables.get(nombre)!;
      this.variables.set(nombre, { valor, tipo: actual.tipo }); // preserva el tipo
      return;
    }
    if (this.padre) {
      this.padre.set(nombre, valor);
      return;
    }
    throw new Error(`Variable '${nombre}' no declarada`);
  }


}