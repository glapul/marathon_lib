#include <windows.h>
#include <cstdio>
#include <iostream>
#include <vector>
#include <stdlib.h>
using namespace std;

LPSTR NazwaKlasy = "FFT GUI";
MSG Komunikat;
HWND g_hUpload;
HWND g_hWyk;
HWND g_hPrzycisk;

vector <int> los;
int nw=1;

LRESULT CALLBACK WndProc( HWND hwnd, UINT msg, WPARAM wParam, LPARAM lParam );

int WINAPI WinMain( HINSTANCE hInstance, HINSTANCE hPrevInstance, LPSTR lpCmdLine, int nCmdShow )
{

    // WYPEŁNIANIE STRUKTURY
    WNDCLASSEX wc;

    wc.cbSize = sizeof( WNDCLASSEX );
    wc.style = 0;
    wc.lpfnWndProc = WndProc;
    wc.cbClsExtra = 0;
    wc.cbWndExtra = 0;
    wc.hInstance = hInstance;
    wc.hIcon = LoadIcon( NULL, IDI_APPLICATION );
    wc.hCursor = LoadCursor( NULL, IDC_ARROW );
    wc.hbrBackground =( HBRUSH ) (1) ;
    wc.lpszMenuName = NULL;
    wc.lpszClassName = NazwaKlasy;
    wc.hIconSm = LoadIcon( NULL, IDI_APPLICATION );



    // REJESTROWANIE KLASY OKNA
    if( !RegisterClassEx( & wc ) )
    {
        MessageBox( NULL, "Error!", "Sorry...",
        MB_ICONEXCLAMATION | MB_OK );
        return 1;
    }

    // TWORZENIE OKNA
    HWND hwnd;

    hwnd = CreateWindowEx( WS_EX_CLIENTEDGE, NazwaKlasy, "FFT from WAV", WS_OVERLAPPEDWINDOW | WS_VISIBLE | WS_VSCROLL | ES_AUTOVSCROLL,
    CW_USEDEFAULT, CW_USEDEFAULT, 1366, 768, NULL, NULL, hInstance, NULL );

    g_hUpload = CreateWindowEx( 0, "STATIC", "Info o Pliku", WS_CHILD | WS_VISIBLE | BS_GROUPBOX ,
    10, 10, 200, 540, hwnd, NULL, hInstance, NULL );

    //g_hWyk = CreateWindowEx( 0, "STATIC", "", WS_CHILD | WS_VISIBLE | WS_VSCROLL | ES_AUTOVSCROLL,
    //220, 10, 1130, 680, hwnd, NULL, hInstance, NULL );

    g_hPrzycisk = CreateWindowEx( 0, "BUTTON", "Generuj", WS_CHILD | WS_VISIBLE,
    20, 520, 180, 25, hwnd, NULL, hInstance, NULL );


    if( hwnd == NULL )
    {
        MessageBox( NULL, "Error!", "Sorry...", MB_ICONEXCLAMATION );
        return 1;
    }

    ShowWindow( hwnd, SW_MAXIMIZE ); // Pokaż okienko...
    UpdateWindow( hwnd );

    RECT okno;
    GetClientRect( hwnd, & okno );

    SCROLLINFO si;
    ZeroMemory( & si, sizeof( si ) );

    si.cbSize = sizeof( SCROLLINFO );
    si.fMask = SIF_RANGE | SIF_PAGE | SIF_POS;
    si.nMin = 0;
    si.nMax = 5000;
    si.nPage = okno.bottom;
    si.nPos = 0;
    SetScrollInfo( hwnd, SB_VERT, & si, TRUE );




    // Pętla komunikatów
    while( GetMessage( & Komunikat, NULL, 0, 0 ) )
    {
        TranslateMessage( & Komunikat );
        DispatchMessage( & Komunikat );
    }


    return Komunikat.wParam;
}

// OBSŁUGA ZDARZEŃ
LRESULT CALLBACK WndProc( HWND hwnd, UINT msg, WPARAM wParam, LPARAM lParam )
{
    switch( msg )
    {
    case WM_CLOSE:
        DestroyWindow( hwnd );
        break;

    case WM_DESTROY:
        PostQuitMessage( 0 );
        break;

        default:
        return DefWindowProc( hwnd, msg, wParam, lParam );
    case WM_COMMAND:
        for (int i=0;i<512;i++)
        {
            los.push_back(rand() % 100 + 1);
        }

        if(( HWND ) lParam == g_hPrzycisk )
                 for (int i=1;i<513;i++)
                {
                    HDC hdcOkno = GetDC( hwnd );
                    HBRUSH PedzelZiel, Pudelko;
                    HPEN OlowekCzerw, Piornik;
                    PedzelZiel = CreateSolidBrush( RGB(61, 61, 61) );
                    OlowekCzerw = CreatePen( PS_SOLID, 1, RGB(61, 61, 61) );
                    Pudelko =( HBRUSH ) SelectObject( hdcOkno, PedzelZiel );
                    Piornik =( HPEN ) SelectObject( hdcOkno, OlowekCzerw );
                    Rectangle( hdcOkno, 240+2*i, nw*200+35-2*los[i-1], 241+2*i, nw*200+35 );
                    SelectObject( hdcOkno, Pudelko );
                    SelectObject( hdcOkno, Piornik );
                    DeleteObject( OlowekCzerw );
                    DeleteObject( PedzelZiel );
                    ReleaseDC( hwnd, hdcOkno );
                }
        los.clear();
        nw++;
        break;
    case WM_VSCROLL: {

        SCROLLINFO si;
        ZeroMemory( & si, sizeof( si ) );
        si.cbSize = sizeof( SCROLLINFO );
        si.fMask = SIF_POS | SIF_PAGE | SIF_TRACKPOS;
        GetScrollInfo( hwnd, SB_VERT, & si );

        int pozycja = si.nPos;

        switch( LOWORD( wParam ) ) {
        case SB_TOP:
            pozycja = 0;
            break;
        case SB_BOTTOM:
            pozycja = 1000;
            break;
        case SB_LINEUP:
            if( pozycja > 0 ) {
                pozycja--;
            }
            break;
        case SB_LINEDOWN:
            if( pozycja < 1000 ) {
                pozycja++;
            }
            break;
        case SB_PAGEUP:
            pozycja -= si.nPage;
            if( pozycja < 0 ) {
                pozycja = 0;
            }
            break;
        case SB_PAGEDOWN:
            pozycja += si.nPage;
            if( pozycja > 1000 ) {
                pozycja = 1000;
            }
            break;
        case SB_THUMBPOSITION:
            pozycja = si.nTrackPos;
            break;
        case SB_THUMBTRACK:
            pozycja = si.nTrackPos;
            break;
        }

        int dy = -( pozycja - si.nPos );
        ScrollWindowEx( hwnd, 0, dy,( CONST RECT * ) NULL,( CONST RECT * ) NULL,( HRGN ) NULL,( LPRECT ) NULL, SW_SCROLLCHILDREN | SW_INVALIDATE | SW_ERASE );
        UpdateWindow( hwnd );

        ZeroMemory( & si, sizeof( si ) );
        si.cbSize = sizeof( SCROLLINFO );
        si.fMask = SIF_POS;
        si.nPos = pozycja;

        SetScrollInfo( hwnd, SB_VERT, & si, TRUE );
        }
        break;
    }

    return 0;
}
