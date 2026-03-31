// ============================================================
// TEST 01 - Variables y Tipos Primitivos
// Cubre: declaración var, inferencia :=, tipos int/float64/
//        string/bool/rune, valores por defecto, conversión
//        implícita int→float64
// ============================================================

func main() {
    // --- Declaración explícita con valor ---
    var edad int = 25
    var precio float64 = 19.99
    var nombre string = "GoScript"
    var activo bool = true
    var letra rune = 'A'

    fmt.Println("=== Valores iniciales ===")
    fmt.Println("edad:", edad)
    fmt.Println("precio:", precio)
    fmt.Println("nombre:", nombre)
    fmt.Println("activo:", activo)
    fmt.Println("letra:", letra)

    // --- Declaración explícita SIN valor (debe tomar default) ---
    var contadorSinValor int
    var precioSinValor float64
    var textoSinValor string
    var flagSinValor bool

    fmt.Println()
    fmt.Println("=== Valores por defecto ===")
    fmt.Println("contadorSinValor:", contadorSinValor)   // 0
    fmt.Println("precioSinValor:", precioSinValor)       // 0.0
    fmt.Println("textoSinValor:", textoSinValor)         // ""
    fmt.Println("flagSinValor:", flagSinValor)           // false

    // --- Inferencia de tipo con := ---
    ciudad := "Guatemala"
    temperatura := 28.5
    esDia := true

    fmt.Println()
    fmt.Println("=== Inferencia de tipo ===")
    fmt.Println("ciudad:", ciudad)
    fmt.Println("temperatura:", temperatura)
    fmt.Println("esDia:", esDia)

    // --- Conversión implícita int → float64 ---
    var resultado float64 = 10 + 5   // enteros se convierten a float64
    fmt.Println()
    fmt.Println("=== Conversión implícita int → float64 ===")
    fmt.Println("resultado (10+5 como float64):", resultado)

    // --- Reasignación de valores (mismo tipo) ---
    edad = 30
    nombre = "Lenguaje GoScript"
    fmt.Println()
    fmt.Println("=== Reasignación ===")
    fmt.Println("edad actualizada:", edad)
    fmt.Println("nombre actualizado:", nombre)

    // --- Bloques independientes y shadowing ---
    x := 100
    fmt.Println()
    fmt.Println("=== Scope / Shadowing ===")
    fmt.Println("x antes del bloque:", x)
    {
        x := 999
        fmt.Println("x dentro del bloque (shadow):", x)
    }
    fmt.Println("x después del bloque:", x)   // sigue siendo 100
}
