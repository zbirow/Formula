import { PHYSICS_FORMULAS } from "./physics-catalog.js";
import { ADVANCED_FORMULAS } from "./advanced-catalog.js";

const input = (id, symbol, label, unit = "") => ({ id, symbol, label, unit });
const output = (symbol, label, unit = "") => ({ id: "result", symbol, label, unit });

export const BASE_FORMULAS = [
  {
    id: "sum", name: "Suma", category: "Podstawowe", equation: "y = a + b",
    description: "Dodaje dwie wartości.", inputs: [input("a", "a", "Składnik A"), input("b", "b", "Składnik B")],
    output: output("y", "Suma"), expression: "a + b", tags: ["dodawanie", "plus"]
  },
  {
    id: "difference", name: "Różnica", category: "Podstawowe", equation: "y = a − c",
    description: "Odejmuje drugą wartość od pierwszej.", inputs: [input("a", "a", "Odjemna"), input("c", "c", "Odjemnik")],
    output: output("y", "Różnica"), expression: "a - c", tags: ["odejmowanie", "minus"]
  },
  {
    id: "product", name: "Iloczyn", category: "Podstawowe", equation: "y = a × b",
    description: "Mnoży dwie wartości.", inputs: [input("a", "a", "Czynnik A"), input("b", "b", "Czynnik B")],
    output: output("y", "Iloczyn"), expression: "a * b", tags: ["mnożenie"]
  },
  {
    id: "quotient", name: "Iloraz", category: "Podstawowe", equation: "y = a / b",
    description: "Dzieli wartość a przez b.", inputs: [input("a", "a", "Dzielna"), input("b", "b", "Dzielnik")],
    output: output("y", "Iloraz"), expression: "a / b", tags: ["dzielenie"]
  },
  {
    id: "power", name: "Potęga", category: "Podstawowe", equation: "y = aⁿ",
    description: "Podnosi podstawę do zadanej potęgi.", inputs: [input("base", "a", "Podstawa"), input("exponent", "n", "Wykładnik")],
    output: output("y", "Potęga"), expression: "base ^ exponent", tags: ["potęgowanie"]
  },
  {
    id: "arithmetic-mean", name: "Średnia arytmetyczna", category: "Podstawowe", equation: "x̄ = (a + b) / 2",
    description: "Średnia z dwóch wartości.", inputs: [input("a", "a", "Wartość A"), input("b", "b", "Wartość B")],
    output: output("x̄", "Średnia"), expression: "(a + b) / 2", tags: ["średnia"]
  },
  {
    id: "percentage", name: "Procent całości", category: "Podstawowe", equation: "p = część / całość × 100",
    description: "Oblicza, jaki procent całości stanowi część.", inputs: [input("part", "część", "Część"), input("whole", "całość", "Całość")],
    output: output("p", "Procent", "%"), expression: "part / whole * 100", tags: ["procent"]
  },
  {
    id: "linear", name: "Funkcja liniowa", category: "Algebra", equation: "y = m·x + b",
    description: "Wartość funkcji liniowej.", inputs: [input("slope", "m", "Współczynnik kierunkowy"), input("x", "x", "Argument"), input("offset", "b", "Wyraz wolny")],
    output: output("y", "Wartość funkcji"), expression: "slope * x + offset", tags: ["prosta", "funkcja"]
  },
  {
    id: "quadratic-discriminant", name: "Delta", category: "Algebra", equation: "Δ = b² − 4ac",
    description: "Wyróżnik równania kwadratowego.", inputs: [input("a", "a", "Współczynnik a"), input("b", "b", "Współczynnik b"), input("c", "c", "Współczynnik c")],
    output: output("Δ", "Delta"), expression: "b ^ 2 - 4 * a * c", tags: ["równanie kwadratowe"]
  },
  {
    id: "quadratic-root-plus", name: "Pierwiastek równania (+)", category: "Algebra", equation: "x₁ = (−b + √Δ) / 2a",
    description: "Pierwsze rozwiązanie równania kwadratowego; delta jest osobnym wejściem.", inputs: [input("a", "a", "Współczynnik a"), input("b", "b", "Współczynnik b"), input("delta", "Δ", "Delta")],
    output: output("x₁", "Pierwiastek"), expression: "(-b + sqrt(delta)) / (2 * a)", tags: ["równanie kwadratowe", "pierwiastek"]
  },
  {
    id: "distance-2d", name: "Odległość punktów", category: "Geometria", equation: "d = √(Δx² + Δy²)",
    description: "Odległość w układzie kartezjańskim.", inputs: [input("dx", "Δx", "Różnica X"), input("dy", "Δy", "Różnica Y")],
    output: output("d", "Odległość"), expression: "sqrt(dx ^ 2 + dy ^ 2)", tags: ["punkty", "kartezjański"]
  },
  {
    id: "pythagorean", name: "Twierdzenie Pitagorasa", category: "Geometria", equation: "c = √(a² + b²)",
    description: "Długość przeciwprostokątnej.", inputs: [input("a", "a", "Przyprostokątna A"), input("b", "b", "Przyprostokątna B")],
    output: output("c", "Przeciwprostokątna"), expression: "sqrt(a ^ 2 + b ^ 2)", tags: ["trójkąt"]
  },
  {
    id: "circle-area", name: "Pole koła", category: "Geometria", equation: "P = πr²",
    description: "Pole koła o promieniu r.", inputs: [input("radius", "r", "Promień")],
    output: output("P", "Pole"), expression: "pi * radius ^ 2", tags: ["koło", "okrąg"]
  },
  {
    id: "circle-circumference", name: "Obwód koła", category: "Geometria", equation: "O = 2πr",
    description: "Długość okręgu o promieniu r.", inputs: [input("radius", "r", "Promień")],
    output: output("O", "Obwód"), expression: "2 * pi * radius", tags: ["koło", "okrąg"]
  },
  {
    id: "rectangle-area", name: "Pole prostokąta", category: "Geometria", equation: "P = a × b",
    description: "Pole prostokąta z długości boków.", inputs: [input("a", "a", "Bok A"), input("b", "b", "Bok B")],
    output: output("P", "Pole"), expression: "a * b", tags: ["prostokąt"]
  },
  {
    id: "triangle-area", name: "Pole trójkąta", category: "Geometria", equation: "P = a·h / 2",
    description: "Pole trójkąta z podstawy i wysokości.", inputs: [input("base", "a", "Podstawa"), input("height", "h", "Wysokość")],
    output: output("P", "Pole"), expression: "base * height / 2", tags: ["trójkąt"]
  },
  {
    id: "sphere-volume", name: "Objętość kuli", category: "Geometria", equation: "V = 4πr³ / 3",
    description: "Objętość kuli o promieniu r.", inputs: [input("radius", "r", "Promień")],
    output: output("V", "Objętość"), expression: "4 * pi * radius ^ 3 / 3", tags: ["kula", "objętość"]
  },
  {
    id: "slope", name: "Nachylenie prostej", category: "Geometria", equation: "m = (y₂−y₁)/(x₂−x₁)",
    description: "Współczynnik kierunkowy prostej przez dwa punkty.", inputs: [input("x1", "x₁", "X punktu 1"), input("y1", "y₁", "Y punktu 1"), input("x2", "x₂", "X punktu 2"), input("y2", "y₂", "Y punktu 2")],
    output: output("m", "Nachylenie"), expression: "(y2 - y1) / (x2 - x1)", tags: ["prosta", "punkty"]
  },
  {
    id: "newton-force", name: "II zasada Newtona", category: "Fizyka", equation: "F = m·a",
    description: "Siła jako iloczyn masy i przyspieszenia.", inputs: [input("mass", "m", "Masa", "kg"), input("acceleration", "a", "Przyspieszenie", "m/s²")],
    output: output("F", "Siła", "N"), expression: "mass * acceleration", tags: ["siła", "newton"]
  },
  {
    id: "work", name: "Praca mechaniczna", category: "Fizyka", equation: "W = F·s",
    description: "Praca wykonana przez stałą siłę równoległą do przesunięcia.", inputs: [input("force", "F", "Siła", "N"), input("distance", "s", "Przesunięcie", "m")],
    output: output("W", "Praca", "J"), expression: "force * distance", tags: ["siła", "energia"]
  },
  {
    id: "kinetic-energy", name: "Energia kinetyczna", category: "Fizyka", equation: "Eₖ = mv² / 2",
    description: "Energia ciała o masie m i prędkości v.", inputs: [input("mass", "m", "Masa", "kg"), input("velocity", "v", "Prędkość", "m/s")],
    output: output("Eₖ", "Energia", "J"), expression: "mass * velocity ^ 2 / 2", tags: ["energia", "ruch"]
  },
  {
    id: "potential-energy", name: "Energia potencjalna", category: "Fizyka", equation: "Eₚ = mgh",
    description: "Grawitacyjna energia potencjalna.", inputs: [input("mass", "m", "Masa", "kg"), input("gravity", "g", "Przyspieszenie grawitacyjne", "m/s²"), input("height", "h", "Wysokość", "m")],
    output: output("Eₚ", "Energia", "J"), expression: "mass * gravity * height", tags: ["energia", "grawitacja"]
  },
  {
    id: "momentum", name: "Pęd", category: "Fizyka", equation: "p = m·v",
    description: "Pęd ciała w ruchu postępowym.", inputs: [input("mass", "m", "Masa", "kg"), input("velocity", "v", "Prędkość", "m/s")],
    output: output("p", "Pęd", "kg·m/s"), expression: "mass * velocity", tags: ["ruch"]
  },
  {
    id: "ohm-law", name: "Prawo Ohma", category: "Elektryczność", equation: "U = I·R",
    description: "Napięcie z natężenia i oporu.", inputs: [input("current", "I", "Natężenie", "A"), input("resistance", "R", "Opór", "Ω")],
    output: output("U", "Napięcie", "V"), expression: "current * resistance", tags: ["prąd", "napięcie"]
  },
  {
    id: "electric-power", name: "Moc elektryczna", category: "Elektryczność", equation: "P = U·I",
    description: "Moc prądu elektrycznego.", inputs: [input("voltage", "U", "Napięcie", "V"), input("current", "I", "Natężenie", "A")],
    output: output("P", "Moc", "W"), expression: "voltage * current", tags: ["prąd", "moc"]
  },
  {
    id: "electric-energy", name: "Energia elektryczna", category: "Elektryczność", equation: "E = P·t",
    description: "Energia pobrana przy stałej mocy.", inputs: [input("power", "P", "Moc", "W"), input("time", "t", "Czas", "s")],
    output: output("E", "Energia", "J"), expression: "power * time", tags: ["energia", "moc"]
  },
  {
    id: "z-score", name: "Wynik standaryzowany", category: "Statystyka", equation: "z = (x − μ) / σ",
    description: "Odległość obserwacji od średniej w odchyleniach standardowych.", inputs: [input("x", "x", "Obserwacja"), input("mean", "μ", "Średnia"), input("stddev", "σ", "Odchylenie standardowe")],
    output: output("z", "Wynik Z"), expression: "(x - mean) / stddev", tags: ["z-score", "średnia"]
  },
  {
    id: "simple-interest", name: "Odsetki proste", category: "Finanse", equation: "I = K·r·t",
    description: "Odsetki bez kapitalizacji; r jako ułamek, np. 0,05.", inputs: [input("principal", "K", "Kapitał"), input("rate", "r", "Stopa"), input("time", "t", "Czas")],
    output: output("I", "Odsetki"), expression: "principal * rate * time", tags: ["odsetki", "kapitał"]
  },
  {
    id: "compound-interest", name: "Kapitalizacja składana", category: "Finanse", equation: "A = K(1 + r)ᵗ",
    description: "Wartość kapitału po t okresach kapitalizacji.", inputs: [input("principal", "K", "Kapitał"), input("rate", "r", "Stopa na okres"), input("time", "t", "Liczba okresów")],
    output: output("A", "Kapitał końcowy"), expression: "principal * (1 + rate) ^ time", tags: ["odsetki", "kapitał"]
  }
];

BASE_FORMULAS.push(
  {
    id: "quadratic-value", name: "Funkcja kwadratowa", category: "Algebra", equation: "y = ax² + bx + c",
    description: "Oblicza wartość paraboli i pokazuje jej wykres, wierzchołek oraz miejsca zerowe.", inputs: [input("a", "a", "Współczynnik a"), input("b", "b", "Współczynnik b"), input("c", "c", "Wyraz wolny"), input("x", "x", "Argument")],
    output: output("y", "Wartość funkcji"), expression: "a * x ^ 2 + b * x + c", tags: ["parabola", "wykres", "funkcja"], assumptions: ["a ≠ 0 dla paraboli", "Dziedzina: wszystkie liczby rzeczywiste"]
  },
  {
    id: "quadratic-root-minus", name: "Pierwiastek równania (−)", category: "Algebra", equation: "x₂ = (−b − √Δ) / 2a",
    description: "Drugie rozwiązanie równania kwadratowego.", inputs: [input("a", "a", "Współczynnik a"), input("b", "b", "Współczynnik b"), input("delta", "Δ", "Delta")],
    output: output("x₂", "Pierwiastek"), expression: "(-b - sqrt(delta)) / (2 * a)", tags: ["równanie kwadratowe"]
  },
  {
    id: "quadratic-vertex-x", name: "Wierzchołek paraboli — x", category: "Algebra", equation: "xᵥ = −b / 2a",
    description: "Współrzędna x wierzchołka paraboli.", inputs: [input("a", "a", "Współczynnik a"), input("b", "b", "Współczynnik b")],
    output: output("xᵥ", "X wierzchołka"), expression: "-b / (2 * a)", tags: ["parabola", "wierzchołek"]
  },
  {
    id: "quadratic-vertex-y", name: "Wierzchołek paraboli — y", category: "Algebra", equation: "yᵥ = c − b² / 4a",
    description: "Współrzędna y wierzchołka paraboli.", inputs: [input("a", "a", "Współczynnik a"), input("b", "b", "Współczynnik b"), input("c", "c", "Wyraz wolny")],
    output: output("yᵥ", "Y wierzchołka"), expression: "c - b ^ 2 / (4 * a)", tags: ["parabola", "wierzchołek"]
  },
  {
    id: "direct-proportion", name: "Proporcjonalność prosta", category: "Algebra", equation: "y = kx",
    description: "Model wielkości rosnących w stałej proporcji.", inputs: [input("k", "k", "Współczynnik"), input("x", "x", "Argument")],
    output: output("y", "Wartość"), expression: "k * x", tags: ["proporcja", "funkcja"]
  },
  {
    id: "inverse-proportion", name: "Proporcjonalność odwrotna", category: "Algebra", equation: "y = k / x",
    description: "Model wielkości o stałym iloczynie.", inputs: [input("k", "k", "Stała"), input("x", "x", "Argument")],
    output: output("y", "Wartość"), expression: "k / x", tags: ["proporcja", "hiperbola"], assumptions: ["x ≠ 0"]
  },
  {
    id: "exponential-function", name: "Funkcja wykładnicza", category: "Algebra", equation: "y = a·bˣ",
    description: "Wzrost lub zanik wykładniczy wraz z miniwykresem.", inputs: [input("scale", "a", "Skala"), input("base", "b", "Podstawa"), input("x", "x", "Argument")],
    output: output("y", "Wartość"), expression: "scale * base ^ x", tags: ["wykładnicza", "wykres"], assumptions: ["b > 0", "b ≠ 1 dla funkcji wykładniczej"]
  },
  {
    id: "logarithm-base", name: "Logarytm o podstawie", category: "Algebra", equation: "y = log_b(x)",
    description: "Logarytm liczby x przy zadanej podstawie.", inputs: [input("x", "x", "Liczba"), input("base", "b", "Podstawa")],
    output: output("y", "Logarytm"), expression: "ln(x) / ln(base)", tags: ["logarytm"], assumptions: ["x > 0", "b > 0", "b ≠ 1"]
  },
  {
    id: "geometric-mean", name: "Średnia geometryczna", category: "Algebra", equation: "G = √(ab)",
    description: "Średnia geometryczna dwóch nieujemnych liczb.", inputs: [input("a", "a", "Wartość A"), input("b", "b", "Wartość B")],
    output: output("G", "Średnia"), expression: "sqrt(a * b)", tags: ["średnia"], assumptions: ["a·b ≥ 0"]
  },
  {
    id: "absolute-value", name: "Wartość bezwzględna", category: "Algebra", equation: "y = |x|",
    description: "Odległość liczby od zera.", inputs: [input("x", "x", "Liczba")], output: output("y", "Wartość bezwzględna"), expression: "abs(x)", tags: ["moduł"]
  },
  {
    id: "determinant-2x2", name: "Wyznacznik macierzy 2×2", category: "Algebra", equation: "det A = ad − bc",
    description: "Wyznacznik macierzy kwadratowej drugiego stopnia.", inputs: [input("a", "a", "A₁₁"), input("b", "b", "A₁₂"), input("c", "c", "A₂₁"), input("d", "d", "A₂₂")],
    output: output("det A", "Wyznacznik"), expression: "a * d - b * c", tags: ["macierz", "wyznacznik"]
  },
  {
    id: "square-area", name: "Pole kwadratu", category: "Geometria", equation: "P = a²",
    description: "Pole kwadratu o boku a.", inputs: [input("side", "a", "Bok")], output: output("P", "Pole"), expression: "side ^ 2", tags: ["kwadrat", "pole"]
  },
  {
    id: "square-perimeter", name: "Obwód kwadratu", category: "Geometria", equation: "O = 4a",
    description: "Obwód kwadratu.", inputs: [input("side", "a", "Bok")], output: output("O", "Obwód"), expression: "4 * side", tags: ["kwadrat", "obwód"]
  },
  {
    id: "rectangle-perimeter", name: "Obwód prostokąta", category: "Geometria", equation: "O = 2(a + b)",
    description: "Suma długości wszystkich boków prostokąta.", inputs: [input("a", "a", "Bok A"), input("b", "b", "Bok B")], output: output("O", "Obwód"), expression: "2 * (a + b)", tags: ["prostokąt"]
  },
  {
    id: "triangle-heron", name: "Pole trójkąta — Heron", category: "Geometria", equation: "P = √s(s−a)(s−b)(s−c)",
    description: "Pole trójkąta z długości trzech boków.", inputs: [input("a", "a", "Bok A"), input("b", "b", "Bok B"), input("c", "c", "Bok C")],
    output: output("P", "Pole"), expression: "sqrt(((a + b + c) / 2) * (((a + b + c) / 2) - a) * (((a + b + c) / 2) - b) * (((a + b + c) / 2) - c))", tags: ["trójkąt", "Heron"], assumptions: ["Boki spełniają nierówność trójkąta"]
  },
  {
    id: "parallelogram-area", name: "Pole równoległoboku", category: "Geometria", equation: "P = a·h",
    description: "Pole równoległoboku z podstawy i wysokości.", inputs: [input("base", "a", "Podstawa"), input("height", "h", "Wysokość")], output: output("P", "Pole"), expression: "base * height", tags: ["równoległobok"]
  },
  {
    id: "trapezoid-area", name: "Pole trapezu", category: "Geometria", equation: "P = (a + b)h / 2",
    description: "Pole trapezu z podstaw i wysokości.", inputs: [input("a", "a", "Podstawa A"), input("b", "b", "Podstawa B"), input("height", "h", "Wysokość")], output: output("P", "Pole"), expression: "(a + b) * height / 2", tags: ["trapez"]
  },
  {
    id: "rhombus-area", name: "Pole rombu z przekątnych", category: "Geometria", equation: "P = e·f / 2",
    description: "Pole rombu z długości przekątnych.", inputs: [input("e", "e", "Przekątna E"), input("f", "f", "Przekątna F")], output: output("P", "Pole"), expression: "e * f / 2", tags: ["romb"]
  },
  {
    id: "ellipse-area", name: "Pole elipsy", category: "Geometria", equation: "P = πab",
    description: "Pole elipsy z półosi a i b.", inputs: [input("a", "a", "Półoś pozioma"), input("b", "b", "Półoś pionowa")], output: output("P", "Pole"), expression: "pi * a * b", tags: ["elipsa"]
  },
  {
    id: "sector-area", name: "Pole wycinka koła", category: "Geometria", equation: "P = αr² / 2",
    description: "Pole wycinka dla kąta α podanego w radianach.", inputs: [input("angle", "α", "Kąt", "rad"), input("radius", "r", "Promień")], output: output("P", "Pole wycinka"), expression: "angle * radius ^ 2 / 2", tags: ["koło", "wycinek"]
  },
  {
    id: "arc-length", name: "Długość łuku", category: "Geometria", equation: "L = αr",
    description: "Długość łuku dla kąta w radianach.", inputs: [input("angle", "α", "Kąt", "rad"), input("radius", "r", "Promień")], output: output("L", "Długość łuku"), expression: "angle * radius", tags: ["koło", "łuk"]
  },
  {
    id: "regular-polygon-area", name: "Pole wielokąta foremnego", category: "Geometria", equation: "P = n·a² / (4tan(π/n))",
    description: "Pole wielokąta foremnego o n bokach.", inputs: [input("n", "n", "Liczba boków"), input("side", "a", "Długość boku")], output: output("P", "Pole"), expression: "n * side ^ 2 / (4 * tan(pi / n))", tags: ["wielokąt"], assumptions: ["n jest liczbą całkowitą ≥ 3"]
  },
  {
    id: "distance-3d", name: "Odległość w przestrzeni", category: "Geometria 3D", equation: "d = √(Δx² + Δy² + Δz²)",
    description: "Odległość dwóch punktów w przestrzeni trójwymiarowej.", inputs: [input("dx", "Δx", "Różnica X"), input("dy", "Δy", "Różnica Y"), input("dz", "Δz", "Różnica Z")], output: output("d", "Odległość"), expression: "sqrt(dx ^ 2 + dy ^ 2 + dz ^ 2)", tags: ["3D", "punkty"]
  },
  {
    id: "sphere-surface", name: "Pole powierzchni kuli", category: "Geometria 3D", equation: "S = 4πr²",
    description: "Pole całej powierzchni kuli.", inputs: [input("radius", "r", "Promień")], output: output("S", "Pole powierzchni"), expression: "4 * pi * radius ^ 2", tags: ["kula", "powierzchnia"]
  },
  {
    id: "cube-volume", name: "Objętość sześcianu", category: "Geometria 3D", equation: "V = a³",
    description: "Objętość sześcianu o krawędzi a.", inputs: [input("side", "a", "Krawędź")], output: output("V", "Objętość"), expression: "side ^ 3", tags: ["sześcian", "objętość"]
  },
  {
    id: "cube-surface", name: "Pole sześcianu", category: "Geometria 3D", equation: "S = 6a²",
    description: "Pole sześciu ścian sześcianu.", inputs: [input("side", "a", "Krawędź")], output: output("S", "Pole powierzchni"), expression: "6 * side ^ 2", tags: ["sześcian", "powierzchnia"]
  },
  {
    id: "cuboid-volume", name: "Objętość prostopadłościanu", category: "Geometria 3D", equation: "V = abc",
    description: "Objętość prostopadłościanu.", inputs: [input("a", "a", "Długość"), input("b", "b", "Szerokość"), input("c", "c", "Wysokość")], output: output("V", "Objętość"), expression: "a * b * c", tags: ["prostopadłościan"]
  },
  {
    id: "cuboid-surface", name: "Pole prostopadłościanu", category: "Geometria 3D", equation: "S = 2(ab + ac + bc)",
    description: "Pole wszystkich ścian prostopadłościanu.", inputs: [input("a", "a", "Długość"), input("b", "b", "Szerokość"), input("c", "c", "Wysokość")], output: output("S", "Pole powierzchni"), expression: "2 * (a * b + a * c + b * c)", tags: ["prostopadłościan"]
  },
  {
    id: "cylinder-volume", name: "Objętość walca", category: "Geometria 3D", equation: "V = πr²h",
    description: "Objętość walca z promienia podstawy i wysokości.", inputs: [input("radius", "r", "Promień"), input("height", "h", "Wysokość")], output: output("V", "Objętość"), expression: "pi * radius ^ 2 * height", tags: ["walec"]
  },
  {
    id: "cylinder-surface", name: "Pole powierzchni walca", category: "Geometria 3D", equation: "S = 2πr(r + h)",
    description: "Pole dwóch podstaw i powierzchni bocznej walca.", inputs: [input("radius", "r", "Promień"), input("height", "h", "Wysokość")], output: output("S", "Pole powierzchni"), expression: "2 * pi * radius * (radius + height)", tags: ["walec"]
  },
  {
    id: "cone-volume", name: "Objętość stożka", category: "Geometria 3D", equation: "V = πr²h / 3",
    description: "Objętość stożka.", inputs: [input("radius", "r", "Promień"), input("height", "h", "Wysokość")], output: output("V", "Objętość"), expression: "pi * radius ^ 2 * height / 3", tags: ["stożek"]
  },
  {
    id: "cone-surface", name: "Pole powierzchni stożka", category: "Geometria 3D", equation: "S = πr(r + l)",
    description: "Pole podstawy i powierzchni bocznej stożka.", inputs: [input("radius", "r", "Promień"), input("slant", "l", "Tworząca")], output: output("S", "Pole powierzchni"), expression: "pi * radius * (radius + slant)", tags: ["stożek"]
  },
  {
    id: "pyramid-volume", name: "Objętość ostrosłupa", category: "Geometria 3D", equation: "V = Pₚ·h / 3",
    description: "Objętość ostrosłupa z pola podstawy i wysokości.", inputs: [input("baseArea", "Pₚ", "Pole podstawy"), input("height", "h", "Wysokość")], output: output("V", "Objętość"), expression: "baseArea * height / 3", tags: ["ostrosłup"]
  },
  {
    id: "sine", name: "Sinus", category: "Trygonometria", equation: "y = sin(α)",
    description: "Sinus kąta podanego w radianach, pokazany również na wykresie.", inputs: [input("angle", "α", "Kąt", "rad")], output: output("y", "Sinus"), expression: "sin(angle)", tags: ["sinus", "wykres"]
  },
  {
    id: "cosine", name: "Cosinus", category: "Trygonometria", equation: "y = cos(α)",
    description: "Cosinus kąta podanego w radianach.", inputs: [input("angle", "α", "Kąt", "rad")], output: output("y", "Cosinus"), expression: "cos(angle)", tags: ["cosinus", "wykres"]
  },
  {
    id: "tangent", name: "Tangens", category: "Trygonometria", equation: "y = tan(α)",
    description: "Tangens kąta w radianach.", inputs: [input("angle", "α", "Kąt", "rad")], output: output("y", "Tangens"), expression: "tan(angle)", tags: ["tangens"]
  },
  {
    id: "degrees-to-radians", name: "Stopnie → radiany", category: "Trygonometria", equation: "αᵣ = α°·π / 180",
    description: "Przelicza miarę kąta na radiany.", inputs: [input("degrees", "α°", "Kąt", "°")], output: output("αᵣ", "Kąt", "rad"), expression: "degrees * pi / 180", tags: ["kąt", "konwersja"]
  },
  {
    id: "radians-to-degrees", name: "Radiany → stopnie", category: "Trygonometria", equation: "α° = αᵣ·180 / π",
    description: "Przelicza radiany na stopnie.", inputs: [input("radians", "αᵣ", "Kąt", "rad")], output: output("α°", "Kąt", "°"), expression: "radians * 180 / pi", tags: ["kąt", "konwersja"]
  },
  {
    id: "cosine-law", name: "Twierdzenie cosinusów", category: "Trygonometria", equation: "c = √(a² + b² − 2ab cos γ)",
    description: "Długość trzeciego boku z dwóch boków i kąta między nimi.", inputs: [input("a", "a", "Bok A"), input("b", "b", "Bok B"), input("gamma", "γ", "Kąt", "rad")], output: output("c", "Bok C"), expression: "sqrt(a ^ 2 + b ^ 2 - 2 * a * b * cos(gamma))", tags: ["trójkąt"]
  },
  {
    id: "sine-law", name: "Twierdzenie sinusów", category: "Trygonometria", equation: "b = a·sin β / sin α",
    description: "Długość boku b z boku a i dwóch kątów.", inputs: [input("a", "a", "Znany bok"), input("alpha", "α", "Kąt naprzeciw a", "rad"), input("beta", "β", "Kąt naprzeciw b", "rad")], output: output("b", "Szukany bok"), expression: "a * sin(beta) / sin(alpha)", tags: ["trójkąt"]
  },
  {
    id: "power-derivative", name: "Pochodna potęgi", category: "Analiza", equation: "(axⁿ)' = an·xⁿ⁻¹",
    description: "Wartość pochodnej jednomianu w punkcie x.", inputs: [input("coefficient", "a", "Współczynnik"), input("n", "n", "Wykładnik"), input("x", "x", "Punkt")], output: output("f′(x)", "Pochodna"), expression: "coefficient * n * x ^ (n - 1)", tags: ["pochodna"]
  },
  {
    id: "quadratic-derivative", name: "Pochodna funkcji kwadratowej", category: "Analiza", equation: "f′(x) = 2ax + b",
    description: "Nachylenie stycznej do paraboli w punkcie x.", inputs: [input("a", "a", "Współczynnik a"), input("b", "b", "Współczynnik b"), input("x", "x", "Punkt")], output: output("f′(x)", "Pochodna"), expression: "2 * a * x + b", tags: ["pochodna", "parabola"]
  },
  {
    id: "linear-integral", name: "Całka oznaczona funkcji liniowej", category: "Analiza", equation: "∫(mx+c)dx [a,b]",
    description: "Pole algebraiczne pod funkcją liniową na przedziale.", inputs: [input("m", "m", "Nachylenie"), input("c", "c", "Wyraz wolny"), input("xStart", "a", "Początek"), input("xEnd", "b", "Koniec")], output: output("I", "Całka"), expression: "m / 2 * (xEnd ^ 2 - xStart ^ 2) + c * (xEnd - xStart)", tags: ["całka"]
  },
  {
    id: "power-integral", name: "Całka oznaczona potęgi", category: "Analiza", equation: "∫kxⁿdx [a,b]",
    description: "Całka jednomianu na przedziale.", inputs: [input("coefficient", "k", "Współczynnik"), input("n", "n", "Wykładnik"), input("xStart", "a", "Początek"), input("xEnd", "b", "Koniec")], output: output("I", "Całka"), expression: "coefficient / (n + 1) * (xEnd ^ (n + 1) - xStart ^ (n + 1))", tags: ["całka"], assumptions: ["n ≠ −1"]
  },
  {
    id: "average-rate", name: "Średnie tempo zmian", category: "Analiza", equation: "v̄ = (f₂ − f₁) / (x₂ − x₁)",
    description: "Średnia zmiana funkcji na jednostkę argumentu.", inputs: [input("f1", "f₁", "Wartość początkowa"), input("f2", "f₂", "Wartość końcowa"), input("x1", "x₁", "Argument początkowy"), input("x2", "x₂", "Argument końcowy")], output: output("v̄", "Tempo zmian"), expression: "(f2 - f1) / (x2 - x1)", tags: ["zmiana", "sieczna"]
  },
  {
    id: "arithmetic-sequence-nth", name: "n-ty wyraz ciągu arytmetycznego", category: "Ciągi", equation: "aₙ = a₁ + (n−1)r",
    description: "Wybrany wyraz ciągu arytmetycznego.", inputs: [input("first", "a₁", "Pierwszy wyraz"), input("n", "n", "Numer wyrazu"), input("difference", "r", "Różnica")], output: output("aₙ", "Wyraz ciągu"), expression: "first + (n - 1) * difference", tags: ["ciąg arytmetyczny"]
  },
  {
    id: "arithmetic-sequence-sum", name: "Suma ciągu arytmetycznego", category: "Ciągi", equation: "Sₙ = n(2a₁ + (n−1)r)/2",
    description: "Suma pierwszych n wyrazów ciągu arytmetycznego.", inputs: [input("first", "a₁", "Pierwszy wyraz"), input("n", "n", "Liczba wyrazów"), input("difference", "r", "Różnica")], output: output("Sₙ", "Suma"), expression: "n * (2 * first + (n - 1) * difference) / 2", tags: ["ciąg arytmetyczny"]
  },
  {
    id: "geometric-sequence-nth", name: "n-ty wyraz ciągu geometrycznego", category: "Ciągi", equation: "aₙ = a₁qⁿ⁻¹",
    description: "Wybrany wyraz ciągu geometrycznego.", inputs: [input("first", "a₁", "Pierwszy wyraz"), input("n", "n", "Numer wyrazu"), input("ratio", "q", "Iloraz")], output: output("aₙ", "Wyraz ciągu"), expression: "first * ratio ^ (n - 1)", tags: ["ciąg geometryczny"]
  },
  {
    id: "geometric-sequence-sum", name: "Suma ciągu geometrycznego", category: "Ciągi", equation: "Sₙ = a₁(1−qⁿ)/(1−q)",
    description: "Suma pierwszych n wyrazów ciągu geometrycznego.", inputs: [input("first", "a₁", "Pierwszy wyraz"), input("n", "n", "Liczba wyrazów"), input("ratio", "q", "Iloraz")], output: output("Sₙ", "Suma"), expression: "first * (1 - ratio ^ n) / (1 - ratio)", tags: ["ciąg geometryczny"], assumptions: ["q ≠ 1"]
  },
  {
    id: "factorial", name: "Silnia", category: "Prawdopodobieństwo", equation: "y = n!",
    description: "Iloczyn liczb naturalnych od 1 do n.", inputs: [input("n", "n", "Liczba")], output: output("y", "Silnia"), expression: "factorial(n)", tags: ["kombinatoryka"], assumptions: ["n jest liczbą całkowitą ≥ 0"]
  },
  {
    id: "variations", name: "Wariacje bez powtórzeń", category: "Prawdopodobieństwo", equation: "V(n,k) = n!/(n−k)!",
    description: "Liczba uporządkowanych wyborów k elementów z n.", inputs: [input("n", "n", "Liczba elementów"), input("k", "k", "Rozmiar wyboru")], output: output("V", "Liczba wariacji"), expression: "factorial(n) / factorial(n - k)", tags: ["kombinatoryka"], assumptions: ["0 ≤ k ≤ n", "n i k są całkowite"]
  },
  {
    id: "combinations", name: "Kombinacje", category: "Prawdopodobieństwo", equation: "C(n,k) = n!/[k!(n−k)!]",
    description: "Liczba nieuporządkowanych wyborów k elementów z n.", inputs: [input("n", "n", "Liczba elementów"), input("k", "k", "Rozmiar wyboru")], output: output("C", "Liczba kombinacji"), expression: "factorial(n) / (factorial(k) * factorial(n - k))", tags: ["kombinatoryka"], assumptions: ["0 ≤ k ≤ n", "n i k są całkowite"]
  },
  {
    id: "probability-complement", name: "Zdarzenie przeciwne", category: "Prawdopodobieństwo", equation: "P(A′) = 1 − P(A)",
    description: "Prawdopodobieństwo, że zdarzenie nie zajdzie.", inputs: [input("p", "P(A)", "Prawdopodobieństwo A")], output: output("P(A′)", "Dopełnienie"), expression: "1 - p", tags: ["prawdopodobieństwo"], assumptions: ["0 ≤ P(A) ≤ 1"]
  },
  {
    id: "probability-independent", name: "Iloczyn zdarzeń niezależnych", category: "Prawdopodobieństwo", equation: "P(A∩B) = P(A)P(B)",
    description: "Prawdopodobieństwo wspólnego zajścia niezależnych zdarzeń.", inputs: [input("pA", "P(A)", "Prawdopodobieństwo A"), input("pB", "P(B)", "Prawdopodobieństwo B")], output: output("P(A∩B)", "Iloczyn"), expression: "pA * pB", tags: ["niezależność"]
  },
  {
    id: "probability-union", name: "Suma zdarzeń", category: "Prawdopodobieństwo", equation: "P(A∪B)=P(A)+P(B)−P(A∩B)",
    description: "Prawdopodobieństwo zajścia co najmniej jednego zdarzenia.", inputs: [input("pA", "P(A)", "Prawdopodobieństwo A"), input("pB", "P(B)", "Prawdopodobieństwo B"), input("pBoth", "P(A∩B)", "Część wspólna")], output: output("P(A∪B)", "Suma"), expression: "pA + pB - pBoth", tags: ["suma zdarzeń"]
  },
  {
    id: "binomial-probability", name: "Rozkład dwumianowy", category: "Prawdopodobieństwo", equation: "P(X=k)=C(n,k)pᵏ(1−p)ⁿ⁻ᵏ",
    description: "Prawdopodobieństwo dokładnie k sukcesów w n próbach.", inputs: [input("n", "n", "Liczba prób"), input("k", "k", "Liczba sukcesów"), input("p", "p", "Szansa sukcesu")], output: output("P", "Prawdopodobieństwo"), expression: "factorial(n) / (factorial(k) * factorial(n - k)) * p ^ k * (1 - p) ^ (n - k)", tags: ["Bernoulli", "dwumianowy"]
  },
  {
    id: "expected-value-two", name: "Wartość oczekiwana — 2 wyniki", category: "Prawdopodobieństwo", equation: "E(X)=x₁p₁+x₂p₂",
    description: "Średni długoterminowy wynik doświadczenia z dwoma rezultatami.", inputs: [input("x1", "x₁", "Wynik 1"), input("p1", "p₁", "Szansa 1"), input("x2", "x₂", "Wynik 2"), input("p2", "p₂", "Szansa 2")], output: output("E(X)", "Wartość oczekiwana"), expression: "x1 * p1 + x2 * p2", tags: ["wartość oczekiwana"]
  },
  {
    id: "weighted-mean", name: "Średnia ważona — 2 wartości", category: "Statystyka", equation: "x̄ = (w₁x₁+w₂x₂)/(w₁+w₂)",
    description: "Średnia dwóch wartości z różnymi wagami.", inputs: [input("x1", "x₁", "Wartość 1"), input("w1", "w₁", "Waga 1"), input("x2", "x₂", "Wartość 2"), input("w2", "w₂", "Waga 2")], output: output("x̄", "Średnia ważona"), expression: "(w1 * x1 + w2 * x2) / (w1 + w2)", tags: ["średnia"]
  },
  {
    id: "rms-two", name: "Średnia kwadratowa — 2 wartości", category: "Statystyka", equation: "RMS = √((x₁²+x₂²)/2)",
    description: "Średnia kwadratowa dwóch obserwacji.", inputs: [input("x1", "x₁", "Wartość 1"), input("x2", "x₂", "Wartość 2")], output: output("RMS", "Średnia kwadratowa"), expression: "sqrt((x1 ^ 2 + x2 ^ 2) / 2)", tags: ["średnia", "RMS"]
  },
  {
    id: "gaussian-density", name: "Gęstość rozkładu normalnego", category: "Statystyka", equation: "f(x)=e^{−(x−μ)²/2σ²}/(σ√2π)",
    description: "Wysokość krzywej Gaussa w punkcie x.", inputs: [input("x", "x", "Obserwacja"), input("mean", "μ", "Średnia"), input("stddev", "σ", "Odchylenie")], output: output("f(x)", "Gęstość"), expression: "exp(-((x - mean) ^ 2) / (2 * stddev ^ 2)) / (stddev * sqrt(2 * pi))", tags: ["normalny", "Gauss"], assumptions: ["σ > 0"]
  }
);

BASE_FORMULAS.push(...PHYSICS_FORMULAS);
BASE_FORMULAS.push(...ADVANCED_FORMULAS);

const VISUALIZATIONS = {
  "linear": { type: "plot-linear", defaults: { slope: 1, offset: 0, x: 1 } },
  "quadratic-value": { type: "plot-quadratic", defaults: { a: 1, b: 0, c: -2, x: 1 } },
  "exponential-function": { type: "plot-exponential", defaults: { scale: 1, base: 2, x: 1 } },
  "sine": { type: "plot-sine", defaults: { angle: 1 } },
  "cosine": { type: "plot-cosine", defaults: { angle: 1 } },
  "projectile-range": { type: "plot-projectile", defaults: { velocity: 18, angle: 0.7, gravity: 9.81 } },
  "wave-speed": { type: "plot-wave", defaults: { frequency: 2, wavelength: 3 } },
  "circle-area": { type: "circle", mode: "area", defaults: { radius: 3 } },
  "circle-circumference": { type: "circle", mode: "perimeter", defaults: { radius: 3 } },
  "sector-area": { type: "sector", mode: "area", defaults: { radius: 3, angle: 1.8 } },
  "rectangle-area": { type: "rectangle", mode: "area", defaults: { a: 4, b: 2.5 } },
  "rectangle-perimeter": { type: "rectangle", mode: "perimeter", defaults: { a: 4, b: 2.5 } },
  "square-area": { type: "square", mode: "area", defaults: { side: 3 } },
  "square-perimeter": { type: "square", mode: "perimeter", defaults: { side: 3 } },
  "triangle-area": { type: "triangle", mode: "area", defaults: { base: 4, height: 3 } },
  "triangle-heron": { type: "triangle", mode: "area", defaults: { a: 3, b: 4, c: 5 } },
  "pythagorean": { type: "right-triangle", mode: "length", defaults: { a: 3, b: 4 } },
  "parallelogram-area": { type: "parallelogram", mode: "area", defaults: { base: 4, height: 2.5 } },
  "trapezoid-area": { type: "trapezoid", mode: "area", defaults: { a: 5, b: 3, height: 2.5 } },
  "ellipse-area": { type: "ellipse", mode: "area", defaults: { a: 4, b: 2.5 } },
  "sphere-volume": { type: "sphere", mode: "volume", defaults: { radius: 3 } },
  "sphere-surface": { type: "sphere", mode: "surface", defaults: { radius: 3 } },
  "cube-volume": { type: "cube", mode: "volume", defaults: { side: 3 } },
  "cube-surface": { type: "cube", mode: "surface", defaults: { side: 3 } },
  "cuboid-volume": { type: "cuboid", mode: "volume", defaults: { a: 4, b: 3, c: 2 } },
  "cuboid-surface": { type: "cuboid", mode: "surface", defaults: { a: 4, b: 3, c: 2 } },
  "cylinder-volume": { type: "cylinder", mode: "volume", defaults: { radius: 2, height: 4 } },
  "cylinder-surface": { type: "cylinder", mode: "surface", defaults: { radius: 2, height: 4 } },
  "cone-volume": { type: "cone", mode: "volume", defaults: { radius: 2, height: 4 } },
  "cone-surface": { type: "cone", mode: "surface", defaults: { radius: 2, slant: 4.5 } },
  "pyramid-volume": { type: "pyramid", mode: "volume", defaults: { baseArea: 9, height: 4 } }
};

for (const formula of BASE_FORMULAS) {
  if (VISUALIZATIONS[formula.id]) formula.visualization = VISUALIZATIONS[formula.id];
  if (formula.id === "sphere-volume") formula.category = "Geometria 3D";
}

for (const formula of BASE_FORMULAS) {
  if (formula.id === "newton-force") formula.category = "Fizyka: siły";
  if (["work", "kinetic-energy", "potential-energy", "momentum"].includes(formula.id)) formula.category = "Fizyka: energia";
}

export const CATEGORY_ORDER = ["Wszystkie", "Podstawowe", "Algebra", "Geometria", "Geometria analityczna", "Geometria 3D", "Trygonometria", "Analiza", "Ciągi", "Prawdopodobieństwo", "Stałe", "Fizyka: ruch", "Fizyka: siły", "Fizyka: energia", "Fizyka: grawitacja", "Fizyka: ciepło", "Fizyka: fale", "Optyka", "Elektryczność", "Magnetyzm", "Płyny", "Fizyka: atom", "Statystyka", "Finanse", "Moje"];

export function getFormulaMap(customFormulas = []) {
  return new Map([...BASE_FORMULAS, ...customFormulas].map((formula) => [formula.id, formula]));
}
