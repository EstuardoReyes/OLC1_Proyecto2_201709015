// ============================================================
// TEST 02 - Operadores Aritméticos y Conversión de Tipos
// Cubre: +  -  *  /  %  +=  -=  negación unaria
//        y todas las combinaciones de tipos definidas en el spec
// ============================================================

func main() {

    // ---- SUMA ----
    fmt.Println("=== SUMA ===")
    fmt.Println(1 + 1)                        // int+int       → 2
    fmt.Println(1 + 1.0)                      // int+float64   → 2.0
    fmt.Println(5 + " manzanas")              // int+string    → "5 manzanas"
    fmt.Println(5 + true)                     // int+bool      → 6
    fmt.Println(3 + 'A')                      // int+rune      → 68

    fmt.Println(1.5 + 2)                      // float64+int   → 3.5
    fmt.Println(1.5 + 2.0)                    // float64+float → 3.5
    fmt.Println(1.5 + " manzanas")            // float64+str   → "1.5 manzanas"
    fmt.Println(1.5 + true)                   // float64+bool  → 2.5
    fmt.Println(1.5 + 'A')                    // float64+rune  → 66.5

    fmt.Println("manzanas" + 5)               // string+int    → "manzanas5"
    fmt.Println("manzanas" + 1.5)             // string+float  → "manzanas1.5"
    fmt.Println("abc" + " df")               // string+string → "abc df"
    fmt.Println("manzanas" + true)            // string+bool   → "manzanastrue"
    fmt.Println("manzanas" + 'A')             // string+rune   → "manzanasA"

    fmt.Println(true + 5)                     // bool+int      → 6
    fmt.Println(true + 1.5)                   // bool+float    → 2.5
    fmt.Println(true + " abc")               // bool+string   → "true abc"
    fmt.Println(true + false)                 // bool+bool     → true
    fmt.Println(true + 'A')                   // bool+rune     → 66

    fmt.Println('A' + 5)                      // rune+int      → 70
    fmt.Println('A' + 1.5)                    // rune+float    → 66.5
    fmt.Println('A' + " manzanas")            // rune+string   → "A manzanas"
    fmt.Println('A' + true)                   // rune+bool     → 66
    fmt.Println('A' + 'B')                    // rune+rune     → 131

    // ---- RESTA ----
    fmt.Println()
    fmt.Println("=== RESTA ===")
    fmt.Println(5 - 3)                        // 2
    fmt.Println(5 - 1.5)                      // 3.5
    fmt.Println(5 - true)                     // 4
    fmt.Println(5 - 'A')                      // -60  (5 - 65)
    fmt.Println(3.5 - 2)                      // 1.5
    fmt.Println(5.5 - 2.0)                    // 3.5
    fmt.Println(5.5 - true)                   // 4.5
    fmt.Println(5.5 - 'A')                    // -59.5
    fmt.Println('A' - 3)                      // 62
    fmt.Println('A' - 1.5)                    // 63.5
    fmt.Println('A' - true)                   // 64
    fmt.Println('A' - 'B')                    // -1

    // ---- MULTIPLICACIÓN ----
    fmt.Println()
    fmt.Println("=== MULTIPLICACIÓN ===")
    fmt.Println(5 * 3)                        // 15
    fmt.Println(5 * 1.5)                      // 7.5
    fmt.Println(3 * "ha")                     // "hahaha"
    fmt.Println(5 * true)                     // 5
    fmt.Println(3 * 'A')                      // 195
    fmt.Println(2.5 * 2)                      // 5.0
    fmt.Println(2.5 * 1.5)                    // 3.75
    fmt.Println(2.5 * true)                   // 2.5
    fmt.Println(2.5 * 'A')                    // 162.5
    fmt.Println(true * 5)                     // 5
    fmt.Println(true * false)                 // false
    fmt.Println('A' * 2)                      // 130
    fmt.Println('A' * 2.5)                    // 162.5
    fmt.Println('A' * true)                   // 65
    fmt.Println('A' * 'B')                    // 4290

    // ---- DIVISIÓN ----
    fmt.Println()
    fmt.Println("=== DIVISIÓN ===")
    fmt.Println(10 / 3)                       // 3  (truncamiento entero)
    fmt.Println(1 / 3.0)                      // 0.3333...
    fmt.Println(13.0 / 13.0)                  // 1.0
    fmt.Println(1.0 / 1)                      // 1.0

    // ---- MÓDULO ----
    fmt.Println()
    fmt.Println("=== MÓDULO ===")
    fmt.Println(10 % 3)                       // 1
    fmt.Println(7 % 2)                        // 1
    fmt.Println(100 % 10)                     // 0

    // ---- OPERADORES DE ASIGNACIÓN +=  -= ----
    fmt.Println()
    fmt.Println("=== += y -= ===")
    var v1 int = 10
    v1 += 10
    fmt.Println("v1 += 10:", v1)             // 20
    v1 -= 5
    fmt.Println("v1 -= 5:", v1)              // 15

    var v2 float64 = 0.0
    v2 += 10
    fmt.Println("v2 += 10:", v2)             // 10.0
    v2 += 10.0
    fmt.Println("v2 += 10.0:", v2)           // 20.0
    v2 -= 3.5
    fmt.Println("v2 -= 3.5:", v2)            // 16.5

    str := "cad"
    str += "cad"
    fmt.Println("str += cad:", str)          // "cadcad"

    // ---- NEGACIÓN UNARIA ----
    fmt.Println()
    fmt.Println("=== NEGACIÓN UNARIA ===")
    fmt.Println(-(10))                        // -10
    fmt.Println(-(-10))                       // 10
    fmt.Println(-(1.0))                       // -1.0
}
