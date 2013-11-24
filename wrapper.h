/*
 * Biblioteczka na marathon
 * ========================
 *
 * Należy pisać program grający DOKŁADNIE JEDNĄ rundę. Gdy biblioteczka wykryje że runda się skończyła, rzuci wyjątek (666,"round terminated").
 * Teoretycznie można go łapać i zaczynać rozwiązywać nową rundę w tym samym programie, ale polecam po prostu go puścić, pozwolić programowi się wyjebać,
 * a całość uruchamiać jeszcze raz pętlą w bashu (skrypt runner.sh).
 *
 * Różne wolne przemyślenia:
 * - dobrze żeby programy, które piszecie były przygotowane na to, że jakieś ruchy zostały już wykonane przed uruchomieniem. Pozwoli to uratować sporo punktów,
 *   gdy program się wyjebie, wywali się połączenie z netem, padnie lapek etc.
 * - ta biblioteczka zakłada że używamy stringów.
 * - komunikacja z serwerem przebiega w ten sposób, że STDIN i STDOUT są na komunikację z serwerem. Wobec tego teoretycznie możecie uzywać po prostu cin i cout,
 *   ale lepiej uzywajcie funkcji send_message(), get_message() a najlepiej send_message_get_response() - rozpatrują one kilka dziwnych przypadków,
 *   a jesli cos się będzie sypać w trakcie kontestu będzie można to szybko naprawić zmieniając tylko kod biblioteczki
 * - jeśli chcecie coś wypisać na ekran, użyjcie STDERR ("cerr << "Jakis komunikat\n"")
 * - w chwili obecnej komunikacja z serwerem wykonuje jakoś ze 2 razy więcej zapytan do serwera w celu upewnienia się, że nie zaczęła się nowa runda etc.
 *   Gdyby wasz program się na tym wysypywał, ustawcie ALWAYS_ASK_FOR_TIME na false
 *
 * Opis funkcji
 * ------------
 * connect()        -   służy do nawiązania połączenia z serwerem. Przyjmuje 4 parametry, których znaczenia wam nie zdradzę.
 *                      Należy ją wywołać na początku programu, oraz po każdej utracie połączenia (wyjątek (777,"connection lost")).
 *                      Uaktualnia curr_round i curr_turn.
 *
 * wait()           -   Czeka do następnej tury.
 *
 * get_time_raw()   -   zwraca 3 elementowy vector<int> w którym znajdują się wartosci z komendy get_time
 *
 * round_number()   -   zwraca na pewno aktualny numer rundy
 *
 * current_turn()   -   analogicznie
 *
 * turns_till_end() -   zwraca ile ruchow zostalo do końca rundy. Również na pewno aktualna wartość. Włącznie z aktualnym.
 *
 * get_score()      -   zwraca twoj wynik
 *
 * get_all_scores() -   zwraca vector<double> wyników wszystkich drużyn
 *
 * my_place()       -   mowi, którzy jestesmy w danej rundzie
 *
 * pachocki_debiak_cygan_place() - zwraca miejsce tej druzyny. Bardzo szybka, niewymagająca połączenia implementacja. Można używać również jako synonima wartości logicznej true, albo do zerowania tablicy:
 *                                  for(int i=0;i<n;i++) tab[i]=pachocki_debiak_cygan_place()-1;
 *
 * send_message()   -   wysyla wiadomosc na serwer. Upewnia się, że wiadomość przeszła (konsumując "OK" z pierwszego wiersza odpowiedzi), jeśli nie przeszła rzuca odpowiednim wyjątkiem.
 *                      Może przyjąć zarówno stringa(gotowa wiadomość), jak i vector<string>, który skonkatenuje rozdzielając poszczególne elementy spacjami.
 *
 * get_message()    -   ta funkcja ma 2 wersje. Przyjmuje dodatkowy argument int lines, domyślnie równy 1, i zwraca vector<string>
 *                      tych linii. Ma też wariant z dopiskiem _and_split na koncu, i zamiast stringów
 *                      zwraca vectory słów (ciągów znaków oddzielonych spacjami)
 *
 * send_message_get_response() - łączy funkcjonalność 2 powyższych. Ma też wariant _and_split().
 *
 * split()          -   dzieli stringa na vector<string> słów (ciągów znaków rozdzielonych znakiem splitter,domyślnie spacją)
 *
 * slice()          -   zwraca kawalek stringa od i-tego do j-ego indeksu. Można dawać wartości ujemne, rozpatruje je modulo dlugosc stringa.
 *
 * stoi()           -   zmienia stringa w long long. Przydatna przy parsowaniu odpowiedzi z serwera.
 *
 * stod()           -   zmienia stringa w double
 *
 * itos()           -   long long -> string
 *
 * dtos()           -   double ->string
 *
 * kto_idzie_po_zarcie() - wypisuje na CERR losową z trzech wartości "glapa", "kaszuba", "debowski". Wartość oznacza kto ma iść po żarcie.
 *
 */
#include<vector>
#include<iostream>
#include<string>
#include "CTcpFwd.h"
using namespace std;

CTcpFwd * Sock;
int curr_round,curr_turn, all_turns;
void connect(string ADDRESS, string PORT, string LOGIN, string PASSWORD);
vector<string> split (string & x,char splitter = " ");
int stoi (string & x);
double stod (string & x);
string itos(long long x);
string dtos(double x);
void send_message(string &x);
vector<string> get_message(int lines=1);
vector<vector<string> > get_message_and_split(int lines=1);
string get_message();
void wait();
vector<double> get_all_scores();
double get_score();
int my_place();
vector<int> get_time_raw();
int round_number();
int current_turn();
int turns_till_end(); //including this one


