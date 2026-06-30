# Formuła

Pierwszy działający prototyp wizualnego edytora zależności między wzorami. Najważniejsza zasada projektu: zgodność symboli nie tworzy zależności. Zależność istnieje wyłącznie wtedy, gdy zapisany przewód łączy konkretny port wyjściowy z konkretnym portem wejściowym.

## Uruchomienie

Wymagany jest Node.js 18 lub nowszy.

```powershell
npm start
```

Następnie otwórz `http://127.0.0.1:4173`.

Testy silnika:

```powershell
npm test
```

## Co już działa

- 212 wzorów w 25 obszarach matematyki i fizyki;
- źródła wartości i edytowalne symbole;
- jawne połączenia port → port;
- automatyczne przeliczanie całego grafu;
- wykrywanie cykli;
- śledzenie pochodzenia wyniku;
- przeciąganie węzłów i wzorów z biblioteki;
- kreator własnych wzorów z bezpiecznym parserem wyrażeń;
- lokalny zapis grafu i własnej biblioteki.
- wykresy funkcji liniowej, kwadratowej, wykładniczej i trygonometrycznej wewnątrz węzłów;
- wizualizacje pól figur 2D oraz powierzchni i objętości brył 3D;
- rzeczywiste proporcje wymiarów figur i brył, skalowane jednolicie do dostępnego miejsca;
- kwadratowe wykresy z autoskalą obejmującą aktualny punkt, wierzchołek i miejsca zerowe;
- szeroki katalog fizyki: ruch, siły, energia, grawitacja, ciepło, fale, optyka, prąd, magnetyzm, płyny i fizyka atomowa;
- osobne węzły stałych fizycznych, dzięki czemu ich pochodzenie także jest jawne.
- nieskończona plansza z przesuwaniem tła, zoomem 20–250% i dopasowaniem całego grafu;
- wielorzędowe, rozwijane kategorie bez ucinania nazw.
- przełączanie całego interfejsu między angielskim i polskim (angielski jest domyślny);
- końcowy składnik „Wynik”, który pokazuje podłączoną wartość bez dodatkowego działania i kopiuje ją w pełnej precyzji;
- skracanie prezentacji liczb po 10 miejscach dziesiętnych bez utraty pełnej wartości;
- automatycznie rozmieszczane opisy boków oraz wszystkie kąty wielokątów.
- wiele niezależnych projektów z listą, tworzeniem, zmianą nazwy, przełączaniem i usuwaniem;
- jawny zapis projektu przyciskiem lub skrótem `Ctrl+S` oraz automatyczny szkic odzyskiwania niezapisanej pracy;
- bezpieczne potwierdzenia przed wyczyszczeniem planszy, wczytaniem przykładu i usunięciem projektu.

## Model semantyczny

Każda instancja węzła ma własne `nodeId`. Każdy port ma stabilne `portId`. Przewód zapisuje cztery pola:

```json
{
  "sourceNodeId": "difference-demo",
  "sourcePortId": "result",
  "targetNodeId": "work-demo",
  "targetPortId": "force"
}
```

Symbole `F`, `a` czy `x` pozostają nazwami do czytania przez człowieka. Można je później zmienić bez zerwania zależności.

## Droga do dużej bazy wzorów

„Wszystkie wzory matematyczne” nie są zamkniętym, skończonym zbiorem. Rozsądny rozwój katalogu to wersjonowany korpus według dziedzin: matematyka szkolna, analiza, algebra liniowa, statystyka, fizyka, elektrotechnika i kolejne specjalizacje. Każda definicja powinna mieć źródło, zakres założeń, dziedzinę, jednostki oraz testy liczbowe. Obecny plik `catalog.js` jest startowym korpusem i formatem importu; kolejnym krokiem może być przeniesienie definicji do walidowanych plików JSON oraz dodanie kontroli wymiarów i jednostek.
