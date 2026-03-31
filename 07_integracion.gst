// ============================================================
// TEST 07 - Prueba de Integración General
// Simula un mini-sistema de gestión de estudiantes.
// Ejercita: structs, funciones, slices, for, if/switch,
//           operadores, scope, recursividad y funciones embebidas.
// ============================================================

struct Curso {
    int id;
    string nombre;
    int creditos;
}

struct Estudiante {
    int carnet;
    string nombre;
    float64 promedio;
    bool activo;
    Curso cursoActual;
}

// Crea un estudiante con valores por defecto de promedio 0.0
func crearEstudiante(carnet int, nombre string, curso Curso) Estudiante {
    Estudiante e = { carnet: carnet, nombre: nombre, promedio: 0.0, activo: true, cursoActual: curso }
    return e
}

// Calcula la letra de la nota
func letraNota(promedio float64) string {
    if promedio >= 90.0 {
        return "A"
    } else if promedio >= 80.0 {
        return "B"
    } else if promedio >= 70.0 {
        return "C"
    } else if promedio >= 60.0 {
        return "D"
    } else {
        return "F"
    }
}

// Devuelve true si aprobó (>= 61)
func aprobó(promedio float64) bool {
    return promedio >= 61.0
}

// Suma de notas de un slice
func sumaNotas(notas []float64) float64 {
    var total float64 = 0.0
    for i := 0; i < len(notas); i++ {
        total += notas[i]
    }
    return total
}

// Calcula promedio desde slice
func calcularPromedio(notas []float64) float64 {
    if len(notas) == 0 {
        return 0.0
    }
    return sumaNotas(notas) / len(notas)
}

// Imprime reporte de un estudiante
func imprimirEstudiante(e Estudiante) {
    fmt.Println("--- Estudiante ---")
    fmt.Println("Carnet  :", e.carnet)
    fmt.Println("Nombre  :", e.nombre)
    fmt.Println("Promedio:", e.promedio)
    fmt.Println("Letra   :", letraNota(e.promedio))
    fmt.Println("Estado  :", aprobó(e.promedio))
    fmt.Println("Curso   :", e.cursoActual.nombre)
    fmt.Println("Créditos:", e.cursoActual.creditos)
}

// Busca un estudiante por carnet en un slice
func buscarPorCarnet(lista []Estudiante, carnet int) int {
    for i, e := range lista {
        if e.carnet == carnet {
            return i
        }
    }
    return -1
}

// Fibonacci iterativo
func fibonacci(n int) int {
    if n <= 0 {
        return 0
    }
    if n == 1 {
        return 1
    }
    var a int = 0
    var b int = 1
    for i := 2; i <= n; i++ {
        var temp int = a + b
        a = b
        b = temp
    }
    return b
}

// ---- Programa principal ----
func main() {

    // Cursos disponibles
    Curso olc1 = { id: 101, nombre: "OLC1", creditos: 4 }
    Curso ipc1 = { id: 102, nombre: "IPC1", creditos: 5 }
    Curso edd  = { id: 103, nombre: "EDD",  creditos: 4 }

    // Crear nómina de estudiantes
    var nomina []Estudiante
    nomina = append(nomina, crearEstudiante(201709015, "Tato",  olc1))
    nomina = append(nomina, crearEstudiante(202100001, "María", ipc1))
    nomina = append(nomina, crearEstudiante(202200002, "Pedro", edd))

    // Asignar promedios (simulando notas)
    notas1 := []float64{88.0, 92.0, 75.0, 85.0}
    notas2 := []float64{55.0, 60.0, 58.0}
    notas3 := []float64{95.0, 98.0, 100.0}

    nomina[0].promedio = calcularPromedio(notas1)
    nomina[1].promedio = calcularPromedio(notas2)
    nomina[2].promedio = calcularPromedio(notas3)

    // Reporte completo
    fmt.Println("========================================")
    fmt.Println("       REPORTE DE ESTUDIANTES")
    fmt.Println("========================================")
    for _, est := range nomina {
        imprimirEstudiante(est)
    }

    // Búsqueda
    fmt.Println()
    fmt.Println("=== Búsqueda por carnet ===")
    idx := buscarPorCarnet(nomina, 202100001)
    if idx != -1 {
        fmt.Println("Encontrado en posición:", idx)
        fmt.Println("Nombre:", nomina[idx].nombre)
    } else {
        fmt.Println("No encontrado")
    }

    idx2 := buscarPorCarnet(nomina, 999999)
    fmt.Println("Buscar 999999:", idx2)    // -1

    // Estadísticas
    fmt.Println()
    fmt.Println("=== Estadísticas ===")
    var aprobados int = 0
    var reprobados int = 0
    for _, e := range nomina {
        if aprobó(e.promedio) {
            aprobados += 1
        } else {
            reprobados += 1
        }
    }
    fmt.Println("Total estudiantes:", len(nomina))
    fmt.Println("Aprobados:", aprobados)
    fmt.Println("Reprobados:", reprobados)

    // Distribución de letras con switch
    fmt.Println()
    fmt.Println("=== Distribución de letras ===")
    for _, e := range nomina {
        letra := letraNota(e.promedio)
        switch letra {
        case "A":
            fmt.Println(e.nombre, "→ Sobresaliente")
        case "B":
            fmt.Println(e.nombre, "→ Muy Bueno")
        case "C":
            fmt.Println(e.nombre, "→ Bueno")
        case "D":
            fmt.Println(e.nombre, "→ Suficiente")
        default:
            fmt.Println(e.nombre, "→ Insuficiente")
        }
    }

    // Serie Fibonacci
    fmt.Println()
    fmt.Println("=== Serie Fibonacci (primeros 10) ===")
    for i := 0; i < 10; i++ {
        fmt.Println("F(", i, ") =", fibonacci(i))
    }

    // Tabla de multiplicar (break y continue)
    fmt.Println()
    fmt.Println("=== Tabla del 7 (saltando múltiplos de 21) ===")
    for i := 1; i <= 10; i++ {
        producto := 7 * i
        if producto % 21 == 0 {
            fmt.Println("  [saltando", producto, "]")
            continue
        }
        fmt.Println("7 x", i, "=", producto)
    }

    // strconv y reflect
    fmt.Println()
    fmt.Println("=== strconv + reflect ===")
    carnetStr := "201709015"
    carnetInt := strconv.Atoi(carnetStr)
    fmt.Println("Carnet como int:", carnetInt)
    fmt.Println("Tipo carnetInt:", reflect.TypeOf(carnetInt))

    precioStr := "1299.99"
    precioFloat := strconv.ParseFloat(precioStr)
    fmt.Println("Precio como float64:", precioFloat)
    fmt.Println("Tipo precioFloat:", reflect.TypeOf(precioFloat))

    // strings.Join con nombres
    nombres := []string{"Tato", "María", "Pedro"}
    fmt.Println("Nombres juntos:", strings.Join(nombres, ", "))

    fmt.Println()
    fmt.Println("=== FIN DE LA PRUEBA DE INTEGRACIÓN ===")
}
