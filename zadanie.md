## info dla claude
w tym katalogu jest gra index.html, będziesz ją zmieniał po części,
każdą zmianę zapiszesz w katalogu changes, będzie tam plik służący do przechowywania zmianw formie plików md. będą się nazywać iteracja-x.md gdzie x będzie kolejną wersją, ty będziesz po uruchomieniu dodawł nastepną i tam zapisywał zmiany z danej sesji.
Ta gra jest w html jest prostą pixelowatą gra i taka zostanie. Trochę ja rozbudujemy.

## zadanie 1
podziel ten plik na mniejsze w zględem tego co się będzie tam znajdować tzn , np style do osobnego pliku, rzeczy związane z logiką do osobnego, tło, osobne i jak uznasz granulacja byle by sensowna trzeba główny plik odchodzudzić
--Wykonane

## zadanie 2
teraz tak zamień grabarza na rycerza który idzie z lewej strony ekranu na prawą, gdzieś na ekranie jest kukła treningowa, za pomoca spacji musi uderzyć w nią, za każdym razem jak uderzy to coś dostaje ale musi trafić,
1 - uderzenie - tarcze
2 - uderzenie - chełm
3 - uderzenie - zbroje
4 - uderzenie - lepszy miecz
5 - uderzenie - godło na tarczy - będzie losowane co tam się na rysuje,

jeżeli nie trafi i po prostu przejdzie obok to za każdym razem traci monetę którą ma przy sobie a ma ich 4, nie uderzenie po raz 5 to strata miecza i koniec gry.
Podsumowując rycerz idzie automatycznie z lewej strony na prawą, za pomoca spacji uderza mieczem.
Reszte zmień tylko to reszta na razie nie ma znaczenia.
Stwórz plik iteracja-2.md
--Wykonane

## zadanie 3
kolejne uderzenia dodają rycerzowi, konia,
następne dają lance, a miecz zostaje przy boku,
a ostanie daje kopie,
ale z kopią jest trochę trudniej, bo ona na początku planszy jest uniesiona, dochodzi nowy przycisk "x" który opuszcza kopie ale ona nie od razu się opuszcza po prostu to chwilę trwa, trzeba dobrze sobie wyliczyć ten moment bo rycerz nie potrafi długo trzymać kopi w tej pozycji, lande umiał dłużej ale kopia jest cięższa, więc ją dzwiga sam do góry,
dlatego przed otrzymaniem lancy rycerz dostaje dodatkowe monety, dwie.
Jak ma konia to porusza się trochę szybciej ale bez przesady, trochę. dodaj kolejną iteracje-3.md
--Wykonanen

## zadanie 4
dodasz ułatwienia czyli jeżeli ktoś dwa razy pod rząd nie trafi w kukłe to pokaże się przed kukłą znacznik informaujący w któym momencie uderzyć, to samo tyczy się posiadania konia, jeżeli uda się  trafić to podpowidz znika ale jak się nie uda to zostaje dalej aż do czasu trafienia lub końca rozgdrywki
dodaj kolejną iteracje
--Wykonane

## zadanie 5
To co było do tej pory to był trening, jeżeli ktoś go przeszedł czyli ma rycerza ze zbroją na koniu i z lancą zakwalifikował się do prawdziwego trunieju.
Podzielimy zmiany na mniejsze części na początek zmień tło z cmentarza na turniej rycerski po środku scena na niej książe z kśiężna na honorowym miejscue, podwyższeniu, trzeba będzie dzwignąć dolną cześć tam gdzei rycerze jeźdzł te górne gdzie jest kula ziemska i robot zmniejsz o 30% tam będzie coś innego ale to potem. Na razie dolna przestrzeń to będzie obok pary książecej będzie tłumy wymachujące horągiwkami, po lewej i prawej stronie będa namioty rycerzy startujące w zawodach, musisz to zrobić tak jak w średniowieczu wyglądało. Na razie tyle. bo to sporo zmian. stwórz plik iteracja z kolejnym numerem.
--Wykonane

## zadanie 6
Gra startuje bez sceny z stworzonej w poprzednim zadaniu, na początek jest trening więc będzie na tle drzew z lewej strony namioty mogą zostać, w tle przechadzają się i trenują inni rycerze, jak skończy się trening to przechodzimy na inne tło ale na razie, gra się kończy na tym że gracz przechodzi trennig i wygrana to przejście na turniej czyli do nowej scenerii.
To zrób teraz scenerie treningową, stwórz kolejny plik z iteracją.
--Wykonane

## Zadanie 7
Teraz zadanie trudniejsze. Trening prowadzi do turnieju ale każde przejście prowadzi do turnieju.
Czyli jeżeli np skończe bez monet tylko z mieczem, to też przechodzę. Jak gracz wejdzie do turnieju to dostaje 2 monety ekstra za przejście. I teraz dostaje wybór żeby wejść do trunieju musi zapłacić 2 monety taka opłata wstępna.
 monit pojawi się na środku pola turniejowego przykrywając wszystko ,znaczy częściowa przeźroczystośc do wyboru dwie opcje tak albo nie, wybór za pomoca strzałem prawo lewo i enter jako zatwierdzenie.
 zrób kolejną iteracje.
 --Wykonane

## zadanie 8
Dwie dodatkowe opcje do treningu
wybranie przycisku 1 oznacza że będzie stała podpowiedz w postaci flagi kolejne naciśnieście 1 wyłącza, przycisk 2 oznacza zakończenie treningu w takim stanie jak jest teraz, czyli np gracz zdobył tarcze i chełm nie stracił monet to przechodzi z całym zdobytym sprzętem oraz monetami i dostaje dwie dodatkowe na opłacenie startu w turnieju.
--Wykonane

## zadanie 9
Usuń obracającą się ziemie oraz robota niech tam będzie na razie czarne tłow, zrób kolejną iteracje
--Wykonane

## zadanie 10
Tam gdzie wcześniej była kula ziemska znowu będzie okienko będzie się nazywać ekwipunek rycerze, a po prawej okienko które będzie się nazywać tabela turnieju,
To będzie już od trennigu widoczne ale jeżeli chodzi o okno ekwipunku to jak będą zdobywane kolejne elementy to będą się one tam pokazywać łącznie z koniem, to będzie się pokazywać jako kolejne elemnty ekwipunku oraz tam będzie pole ilość monet.
Zaś okno turnieju będzie prezentować, listę rycerzy np Wyrwichwast z nad Wisły, albo Hujogryz z Krakowa, czy Przydupas z Kozie bóbki, będzie ich tam 10, i oni będą nie zmienni na razie. Zrób kolejną iteracje
--Wykonane

## zadanie 11
Teraz zmiana najwieksza, dodajemy boty, czyli przeciwników na turnieju.
Ale będą zasady wejścia
Zasady zależą od naszego wyposażenia oraz stanu monet, z jakimi wyszliśmy z treningu.
Jeżeli mamy pełne wyposażenie i cały zapas monet trafiamy do najlepsej dziesiątki i pokonanie ich będzie oznaczać zwycięstwo w grze.
to była ścieżka typu happy path czyli wszystko mamy, teraz skrajność przeciwna,
nie mamy monet ani żadnego elementu wyposażenia, trafiamy na najniższe miejsce na liście ale ta lista nie jest jakby słabsza liga niż gracz z wyposażeniem i sakwą pełną pieniędzy.
Grupy wynikowe:
- brak ekwipunku i pieniędzy - czyli najgorsza liga rycerska - tu trzeba wygrać pierwszą walkę inaczej się odpada, ale wygrana będzie miała podpowiedz bo będzie punkt podpowiedzi wyświetlany w każdej pierwszej walce na turnieju będzie podpowiedz wyświetlana, taki gracz musi zdobyć wystarczającą ilośc monet żeby zakupić cały sprzęt i opłacić wejście do kolejnej ligi, więc droga będzie długa, ale o zakupach w kolejnej iteracji,
- ekwipunek tarcza, chełm, miecz, zbroja każdy z tych elementów podnosi nas w rankingu z automatu a jeżeli są jeszcze monety to jest łatwiej, ale daje to jest ta sama liga tylko tu jest nie 10 przeciwników a 20 przeciwników,
- mam całą zbroję i herm na tarczy to przenoso nas do ligi wyższej gdzie jest 15 przeciwników, tu jest mniej tu będą też ci którzy zdobyli konia i lance,
- wszystkie elementy wyposażenia to liga najwyższa 10 przeciwników
Jak wygląda walka to jest podobne do treningu z tą różnicą że przeciwnik się rusza w naszą stronę i uderza, na każdą walke są trzy podejścia, przeciwnik w trzech pierwszych walkach ma skuteczność 30% procent kolejne 5 to 60% a ostatnie 3 to skuteczność 90% tyle że ostatnie trzy walki mają 4 rundy.
Procenty trzeba odwzorować do niższych lig.
Teraz tak jeżeli to jest gracz ma już konia to przeciwnik też czyli nigdy nie ma tak że przeciwnik jest lepiej lub gorej wyposażony jak gracz zawsze tak samo.
Jeżeli przeciwnik nie ma konia to jest to walka piechurów, jak jest koń to walka konna z lanca albo z kopią.
Zwycięstwo to 4 monety do przodu porażka to dwie, jeżeli monety po porażce spdano do 0 lub poniżej tzn że koniec gry.
Zrób nową iteracje-11.md
--Wykonane

## zadanie 12
KOlejna zmiana, walka konna będzie się odbywać do remisu czyli 1 do 1 wtedy walka z konia kończy się i będzie walka piesza.
Ale piesza walka się zmieni. Teraz będzie ona wyglądać w taki sposób że będzie kierowana przez gracza.
Opisze wygląd walki pieszej.
Runda się zaczyna od przejścia rycerza sterowanego przez gracza od lewej strony ekranu do środka przeciwnik sterowany przez komputer też staje na środku. Czyli stoją na przeciwko siebie.
Najwieksza zmiana będzie taka że sterowanie rycerzem będzie za pomocą strzałem lewa - prawa, tył -  przód oczywiście spacja to uderzanie mieczem. Walka będzie polegać na tym żeby uderzyć przeciwnika i uskoczyć w tył żeby przeciwnik nie trafił. Wprowadzony tez będzie system inforamujący o stanie przeciwnika i swoim. CZyli pasek życia, będzie się włączam podczas waliko konnej oraz pieszej.
I tak na razie ustawiamy obrażenia:
- 5 - miecz podstawowy,
- 10 - miecz lepszy
- 25 - lanca
- 50 - kopia
Jak jest pojedynek na kopie i rycerze schodzą z koni to pasek jest liczony od nowa czyli od 100.
Tak więc walka piesza to będzie 10 uderzeń trafionych, ale może być tak że jak jest 7 to jedna ze stron może się poddać to jest automatycznie taki monit wyskakuje że 7 uderzeń trafionych na przeciwniku, walko może się zakończyć wygraną tego co trafił przeciwnika 7 razy, no i przyjmujemy że rycerze będący na końcu stawki będą wyberać tę opcje ci z najwyższych miejsc nie.
Na razie nie bierzmy zbroi pod uwagę. dodaj kolejny plik iteracji iteracja-12.md
--Wykonane

## zadanie 13
Trzeba poprawić rycerza jak walczy w ręcz, bo znikają mu nogi i podpowiedz wyłączyć za pomocą przycisku 1.
Po za tym jak gracz wygra, to przenosi się do nowej lokalizacji będzie ona takim miasteczkiem gdzie w tle chodzą ludzie, jest kowal, któ©y kuje miecz, inn człowiek ostrzy nóż, jeszcze ktoś inny kucharz wsadza chleb do pieca gdzeiś obok w piekrani, no i jest karczma przed która kilku rycerzy rozmawi z lewej strony jest namiot gracza, od nie go zaczyna gracz.
--Wykonane
