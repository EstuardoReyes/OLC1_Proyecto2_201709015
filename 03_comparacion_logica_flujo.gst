// ============================================================
// TEST 03 - Operadores de Comparación, Lógicos y Control de Flujo
// Cubre: ==  !=  <  <=  >  >=  &&  ||  !
//        if/else if/else   switch/case   for (3 formas)
//        break   continue
// ============================================================

func main() {

    // ---- IGUALDAD Y DESIGUALDAD ----
    fmt.Println("=== IGUALDAD / DESIGUALDAD ===")
    fmt.Println(1 == 1)           // true
    fmt.Println(1 != 1)           // false
    fmt.Println(13.0 == 13.0)     // true
    fmt.Println(35 == 35.0)       // true  (int vs float64)
    fmt.Println(true == false)    // false
    fmt.Println(false != true)    // true
    fmt.Println("ho" == "Ha")     // false
    fmt.Println("Ho" != "Ho")     // false
    fmt.Println('h' == 'a')       // false
    fmt.Println('H' != 'H')       // false

    // ---- RELACIONALES ----
    fmt.Println()
    fmt.Println("=== RELACIONALES ===")
    fmt.Println(1 < 1)            // false
    fmt.Println(13.0 >= 13.0)     // true
    fmt.Println(65 >= 70.7)       // false
    fmt.Println(40.6 >= 30)       // true
    fmt.Println('a' <= 'b')       // true
    fmt.Println('z' > 'a')        // true

    // ---- OPERADORES LÓGICOS ----
    fmt.Println()
    fmt.Println("=== LÓGICOS ===")
    fmt.Println(true && true)     // true
    fmt.Println(true && false)    // false
    fmt.Println(false || true)    // true
    fmt.Println(false || false)   // false
    fmt.Println(!true)            // false
    fmt.Println(!false)           // true
    fmt.Println(!(1 > 2))         // true

    // ---- IF / ELSE IF / ELSE ----
    fmt.Println()
    fmt.Println("=== IF / ELSE ===")

    nota := 85
    if nota >= 90 {
        fmt.Println("Excelente")
    } else if nota >= 70 {
        fmt.Println("Aprobado")       // debe imprimir esto
    } else {
        fmt.Println("Reprobado")
    }

    // condición con paréntesis (también es válido)
    x := 42
    if (x % 2 == 0) {
        fmt.Println("x es par")       // debe imprimir esto
    } else {
        fmt.Println("x es impar")
    }

    // if anidados
    a := 10
    b := 20
    if a < b {
        if a > 0 {
            fmt.Println("a es positivo y menor que b")  // debe imprimir
        }
    }

    // ---- SWITCH / CASE ----
    fmt.Println()
    fmt.Println("=== SWITCH ===")

    dia := 3
    switch dia {
    case 1:
        fmt.Println("Lunes")
    case 2:
        fmt.Println("Martes")
    case 3:
        fmt.Println("Miércoles")    // debe imprimir esto
    case 4:
        fmt.Println("Jueves")
    default:
        fmt.Println("Otro día")
    }

    // switch sin match y sin default → no imprime nada
    numero := 99
    switch numero {
    case 1:
        fmt.Println("uno")
    case 2:
        fmt.Println("dos")
    }
    fmt.Println("Después del switch sin match")   // debe imprimir

    // switch con string
    color := "rojo"
    switch color {
    case "azul":
        fmt.Println("Es azul")
    case "rojo":
        fmt.Println("Es rojo")    // debe imprimir
    default:
        fmt.Println("Color desconocido")
    }

    // ---- FOR estilo while ----
    fmt.Println()
    fmt.Println("=== FOR (estilo while) ===")
    i := 1
    for i <= 5 {
        fmt.Println(i)
        i++
    }

    // ---- FOR estilo clásico ----
    fmt.Println()
    fmt.Println("=== FOR (clásico) ===")
    for j := 0; j < 5; j++ {
        fmt.Println(j)
    }

    // ---- FOR con BREAK ----
    fmt.Println()
    fmt.Println("=== FOR + BREAK ===")
    for k := 0; k < 10; k++ {
        if k == 5 {
            fmt.Println("Break en k =", k)
            break
        }
        fmt.Println(k)
    }

    // ---- FOR con CONTINUE ----
    fmt.Println()
    fmt.Println("=== FOR + CONTINUE (solo impares) ===")
    for n := 1; n <= 10; n++ {
        if n % 2 == 0 {
            continue
        }
        fmt.Println(n)
    }

    // ---- FOR range sobre slice ----
    fmt.Println()
    fmt.Println("=== FOR RANGE ===")
    numeros := []int{10, 20, 30, 40, 50}
    for idx, val := range numeros {
        fmt.Println("idx:", idx, "val:", val)
    }
}
