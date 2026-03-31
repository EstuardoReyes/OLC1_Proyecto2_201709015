// ============================================================
// TEST 05 - Structs y Funciones
// Cubre: definición de struct, instanciación, acceso a
//        atributos, structs anidados, funciones con/sin
//        parámetros y retorno, paso por valor vs referencia
// ============================================================

// ---- Definición de structs (ámbito global) ----

struct Direccion {
    string calle;
    string ciudad;
    int codigoPostal;
}

struct Persona {
    string nombre;
    int edad;
    bool esEstudiante;
    Direccion direccion;
}

struct Producto {
    int id;
    string nombre;
    float64 precio;
}

// ---- Funciones ----

// Sin parámetros, sin retorno
func saludar() {
    fmt.Println("¡Hola desde GoScript!")
}

// Con parámetros, con retorno int
func sumar(a int, b int) int {
    return a + b
}

// Con retorno float64
func calcularPromedio(a float64, b float64, c float64) float64 {
    return (a + b + c) / 3.0
}

// Retorna string
func describir(p Persona) string {
    return p.nombre + " tiene " + p.edad + " años"
}

// Modifica struct por referencia
func cumpleaños(p Persona) {
    p.edad = p.edad + 1
}

// Trabaja con slice (por referencia)
func agregarProducto(lista []Producto, p Producto) []Producto {
    return append(lista, p)
}

// Recursividad: factorial
func factorial(n int) int {
    if n <= 1 {
        return 1
    }
    return n * factorial(n - 1)
}

// Retorna bool
func esMayorDeEdad(edad int) bool {
    return edad >= 18
}

// ---- Programa principal ----
func main() {

    // ---- Structs básicos ----
    fmt.Println("=== Structs básicos ===")

    Persona alice = { nombre: "Alice", edad: 25, esEstudiante: true, direccion: { calle: "4ta Avenida", ciudad: "Guatemala", codigoPostal: 1001 } }

    fmt.Println("Nombre:", alice.nombre)
    fmt.Println("Edad:", alice.edad)
    fmt.Println("Es estudiante:", alice.esEstudiante)
    fmt.Println("Ciudad:", alice.direccion.ciudad)
    fmt.Println("Código postal:", alice.direccion.codigoPostal)

    // Modificar atributos
    alice.edad = 26
    alice.direccion.ciudad = "Antigua"
    fmt.Println("Edad actualizada:", alice.edad)
    fmt.Println("Ciudad actualizada:", alice.direccion.ciudad)

    // Imprimir struct completo
    fmt.Println("Struct completo:", alice)

    // ---- Funciones ----
    fmt.Println()
    fmt.Println("=== Funciones ===")

    saludar()

    resultado := sumar(5, 10)
    fmt.Println("sumar(5, 10):", resultado)           // 15

    promedio := calcularPromedio(7.0, 8.5, 9.0)
    fmt.Println("promedio(7,8.5,9):", promedio)       // 8.166...

    fmt.Println(describir(alice))                     // "Alice tiene 26 años"

    // Paso por referencia: cumpleaños debe modificar alice
    cumpleaños(alice)
    fmt.Println("Edad tras cumpleaños:", alice.edad)  // 27

    fmt.Println("¿Es mayor de edad?", esMayorDeEdad(alice.edad))  // true
    fmt.Println("¿Es mayor de edad (15)?", esMayorDeEdad(15))     // false

    // ---- Recursividad ----
    fmt.Println()
    fmt.Println("=== Recursividad ===")
    for i := 0; i <= 7; i++ {
        fmt.Println(i, "! =", factorial(i))
    }

    // ---- Slices de structs ----
    fmt.Println()
    fmt.Println("=== Slice de structs ===")

    Producto p1 = { id: 1, nombre: "Laptop", precio: 1299.99 }
    Producto p2 = { id: 2, nombre: "Mouse", precio: 25.50 }

    var catalogo []Producto
    catalogo = agregarProducto(catalogo, p1)
    catalogo = agregarProducto(catalogo, p2)

    fmt.Println("Productos en catálogo:", len(catalogo))
    for i, prod := range catalogo {
        fmt.Println(i, "→", prod.nombre, "Q", prod.precio)
    }

    // ---- reflect.TypeOf ----
    fmt.Println()
    fmt.Println("=== reflect.TypeOf ===")
    num := 42
    dec := 3.1416
    txt := "hola"
    flag := true
    sli := []int{1, 2, 3}

    fmt.Println("Tipo num:", reflect.TypeOf(num))
    fmt.Println("Tipo dec:", reflect.TypeOf(dec))
    fmt.Println("Tipo txt:", reflect.TypeOf(txt))
    fmt.Println("Tipo flag:", reflect.TypeOf(flag))
    fmt.Println("Tipo sli:", reflect.TypeOf(sli))
    fmt.Println("Tipo alice:", reflect.TypeOf(alice))

    // ---- strconv ----
    fmt.Println()
    fmt.Println("=== strconv ===")
    entero := strconv.Atoi("123")
    fmt.Println("Atoi('123'):", entero)

    decimal := strconv.ParseFloat("98.6")
    fmt.Println("ParseFloat('98.6'):", decimal)
}
