// ============================================================
// TEST 04 - Slices (1D y Multidimensionales)
// Cubre: creación, acceso, modificación, append, len,
//        slices.Index, strings.Join, for range, matrices 2D
// ============================================================

func main() {

    // ---- Creación e inicialización ----
    fmt.Println("=== Creación de slices ===")
    numeros := []int{10, 20, 30, 40, 50}
    fmt.Println(numeros)                      // [10 20 30 40 50]

    palabras := []string{"hola", "mundo", "go"}
    fmt.Println(palabras)                     // [hola mundo go]

    flags := []bool{true, false, true}
    fmt.Println(flags)                        // [true false true]

    // Slice vacío declarado con var
    var vacio []int
    fmt.Println("slice vacío:", vacio)        // []

    // ---- Acceso y modificación ----
    fmt.Println()
    fmt.Println("=== Acceso y modificación ===")
    fmt.Println("numeros[0]:", numeros[0])    // 10
    fmt.Println("numeros[2]:", numeros[2])    // 30
    numeros[2] = 100
    fmt.Println("numeros después de numeros[2]=100:", numeros)

    // ---- Función len ----
    fmt.Println()
    fmt.Println("=== len ===")
    fmt.Println("len(numeros):", len(numeros))    // 5
    fmt.Println("len(palabras):", len(palabras))  // 3
    fmt.Println("len(vacio):", len(vacio))         // 0

    // ---- Función append ----
    fmt.Println()
    fmt.Println("=== append ===")
    numeros = append(numeros, 999)
    fmt.Println("numeros después de append(999):", numeros)
    fmt.Println("len ahora:", len(numeros))    // 6

    vacio = append(vacio, 1)
    vacio = append(vacio, 2)
    vacio = append(vacio, 3)
    fmt.Println("vacio después de 3 appends:", vacio)   // [1 2 3]

    // ---- slices.Index ----
    fmt.Println()
    fmt.Println("=== slices.Index ===")
    fmt.Println(slices.Index(numeros, 100))   // posición de 100 (era numeros[2])
    fmt.Println(slices.Index(numeros, 999))   // último elemento
    fmt.Println(slices.Index(numeros, 777))   // -1 (no existe)

    // ---- strings.Join ----
    fmt.Println()
    fmt.Println("=== strings.Join ===")
    fmt.Println(strings.Join(palabras, " "))   // "hola mundo go"
    fmt.Println(strings.Join(palabras, "-"))   // "hola-mundo-go"
    fmt.Println(strings.Join(palabras, ""))    // "holamundogo"

    // ---- for range sobre slice ----
    fmt.Println()
    fmt.Println("=== for range ===")
    colores := []string{"rojo", "verde", "azul"}
    for i, c := range colores {
        fmt.Println(i, ":", c)
    }

    // ---- Slice multidimensional (matriz) ----
    fmt.Println()
    fmt.Println("=== Matriz 2D ===")
    mtx := [][]int{
        {1, 2, 3},
        {4, 5, 6},
        {7, 8, 9},
    }
    fmt.Println("mtx[0][0]:", mtx[0][0])   // 1
    fmt.Println("mtx[1][1]:", mtx[1][1])   // 5
    fmt.Println("mtx[2][2]:", mtx[2][2])   // 9

    // Modificar un elemento
    mtx[0][0] = 99
    fmt.Println("mtx[0][0] después de asignar 99:", mtx[0][0])

    // Recorrer la matriz
    fmt.Println()
    fmt.Println("Recorrido completo de la matriz:")
    for i, fila := range mtx {
        for j, val := range fila {
            fmt.Println("mtx[", i, "][", j, "] =", val)
        }
    }

    // Slice de slices con distintos tamaños (jagged)
    fmt.Println()
    fmt.Println("=== Matriz jagged ===")
    jagged := [][]int{
        {1, 2, 3},
        {4, 5},
        {6, 7, 8, 9},
    }
    fmt.Println("len fila 0:", len(jagged[0]))  // 3
    fmt.Println("len fila 1:", len(jagged[1]))  // 2
    fmt.Println("len fila 2:", len(jagged[2]))  // 4

    // Agregar nueva fila con append
    nuevaFila := []int{10, 11}
    mtx = append(mtx, nuevaFila)
    fmt.Println("mtx tras append de fila nueva:")
    fmt.Println("mtx[3][1]:", mtx[3][1])   // 11
}
