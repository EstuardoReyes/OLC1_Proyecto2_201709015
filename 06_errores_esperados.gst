// ============================================================
// TEST 06 - Errores Semánticos (esperados)
// Cada bloque tiene UN error comentado con lo que debería
// reportar el intérprete.  Descomenta de a uno para probar.
// ============================================================

func main() {

    // --- ERROR 1: asignar float64 a int ---
    // Esperado: error semántico - tipo incompatible
    // var x int = 10.5

    // --- ERROR 2: asignar bool a string ---
    // Esperado: error semántico - tipo incompatible
    // var s string = true

    // --- ERROR 3: redefinir variable en el mismo ámbito ---
    // Esperado: error semántico - variable ya declarada
    // var y int = 1
    // var y int = 2

    // --- ERROR 4: usar variable no declarada ---
    // Esperado: error semántico - variable no definida
    // fmt.Println(noExiste)

    // --- ERROR 5: división entre cero (entero) ---
    // Esperado: error semántico - división por cero
    // fmt.Println(10 / 0)

    // --- ERROR 6: división entre cero (float) ---
    // Esperado: error semántico - división por cero
    // var z float64 = 5.0 / 0.0

    // --- ERROR 7: módulo con tipos no enteros ---
    // Esperado: error semántico - operación inválida
    // fmt.Println(5.5 % 2)

    // --- ERROR 8: operador lógico con no-booleano ---
    // Esperado: error semántico - se esperaba bool
    // fmt.Println(1 && true)

    // --- ERROR 9: break fuera de ciclo ---
    // Esperado: error semántico - break fuera de contexto
    // break

    // --- ERROR 10: continue fuera de ciclo ---
    // Esperado: error semántico - continue fuera de contexto
    // continue

    // --- ERROR 11: acceso a índice fuera de rango ---
    // Esperado: error semántico - índice fuera de rango
    // nums := []int{1, 2, 3}
    // fmt.Println(nums[10])

    // --- ERROR 12: operación sobre nil ---
    // Esperado: error semántico - operación sobre nil
    // var nilSlice []int
    // fmt.Println(nilSlice[0])

    // --- ERROR 13: strconv.Atoi con string no numérico ---
    // Esperado: error en tiempo de ejecución
    // v := strconv.Atoi("abc")

    // --- ERROR 14: strconv.Atoi con decimal ---
    // Esperado: error - no admite decimales
    // v2 := strconv.Atoi("12.5")

    // --- ERROR 15: símbolo no válido (léxico) ---
    // Esperado: error léxico - símbolo no reconocido
    // var a¬b int = 10

    // --- Si todos los errores están comentados, esto corre sin problemas ---
    fmt.Println("Todos los errores están comentados — archivo limpio")
    var ok int = 42
    fmt.Println("ok =", ok)
}
