Rozpoznawanie dzwieku - projekt na algo
=======================================


Prezentacja w środę
-------------------

Na środę (na prezentację) robimy program, który czyta plik wav z dysku i wyswietla FFT kolejnych 5s fragmentow po jakiejs normalizacji, odszumianiu etc.
####Język
    Piszemy w C++. Kazdy kawalek powinien byc plikiem w C++, później je razem skompilujemy.

####Chwilowy podział pracy:
* Francuz odczytywanie dzwieku
    - zwraca
        ```
            vector<double> sound
        ```
	//pozostało mi ogarnąć kod, a tak to CHYBA działa
* Glapa FFT etc
    - zwraca
    ```
        vector<vector<double> >  FFTs
    ```
* Morawski, Bartosik wyświetlanie wykresów

####Termin
    Dobrze by było, gdyby wszystkie elementy chociaz prowizorycznie działały do poniedziałku w nocy. Wtedy we wtorek bysmy gdzies siedli i to zgrali razem

