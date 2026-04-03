// src/interpreter/grammar/entorno.ts

export class Entorno {
  private variables: Map<string, any> = new Map();

  constructor(private padre: Entorno | null) {}

  // Declarar variable en el scope actual
  declarar(nombre: string, valor: any): void {
    this.variables.set(nombre, valor);
  }

  // Leer variable — sube al padre si no la encuentra
  get(nombre: string): any {
    if (this.variables.has(nombre)) return this.variables.get(nombre);
    if (this.padre) return this.padre.get(nombre).valor;
    throw new Error(`Variable '${nombre}' no declarada`);
  }

  // Asignar — busca dónde fue declarada
  set(nombre: string, valor: any): void {
    if (this.variables.has(nombre)) {
      this.variables.set(nombre, valor);
      return;
    }
    if (this.padre) {
      this.padre.set(nombre, valor);
      return;
    }
    throw new Error(`Variable '${nombre}' no declarada`);
  }
}