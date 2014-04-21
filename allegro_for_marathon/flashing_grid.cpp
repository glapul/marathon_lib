#include <stdio.h>
#include <allegro5/allegro.h>
#include <allegro5/allegro_image.h>
#include <allegro5/allegro_primitives.h>
#include <vector>
#include <algorithm>
#include<cstdlib>
using namespace std;


const float FPS = 4;
const int SCREEN_W = 1000;
const int SCREEN_H = 1000;
const int BOUNCER_SIZE = 32;
struct grid
{
    int n,m;
    int pixel_height, pixel_width, offset_height, offset_width;
    vector<vector<int> > v;
    grid(int n, int m, int ph,int pw,int oh,int ow)
        :n(n),m(m),pixel_height(ph),pixel_width(pw),offset_height(oh),offset_width(ow)
    {
        v = vector<vector<int> >(n);
        for(int i=0;i<n;i++)
            v[i]=vector<int>(m);
    }
    pair<int,int> translate(int a, int b)
    {
        return make_pair(offset_width+ b*(pixel_width/m),offset_height+a*(pixel_height/n));
    }
    void draw()
    {
        for(int i=0;i<n;i++)
            for(int j=0;j<m;j++)
                al_draw_filled_rectangle(translate(i,j).first,
                        translate(i,j).second,
                        translate(i+1,j+1).first,
                        translate(i+1,j+1).second,
                        al_map_rgb(v[i][j]*255,v[i][j]*255,v[i][j]*255));
    }
    void alter()
    {
        v[rand()%n][rand()%m]^=1;
    }


};

int main(int argc, char **argv){
    ALLEGRO_DISPLAY *display = NULL;
    ALLEGRO_EVENT_QUEUE *event_queue = NULL;
    ALLEGRO_TIMER *timer = NULL;

    if(!al_init()) {
        fprintf(stderr, "failed to initialize allegro!\n");
        return -1;
    }

    timer = al_create_timer(1.0 / FPS);
    if(!timer) {
        fprintf(stderr, "failed to create timer!\n");
        return -1;
    }

    display = al_create_display(SCREEN_W, SCREEN_H);
    if(!display) {
        fprintf(stderr, "failed to create display!\n");
        al_destroy_timer(timer);
        return -1;
    }
    al_init_primitives_addon();

    al_set_target_bitmap(al_get_backbuffer(display));

    event_queue = al_create_event_queue();
    if(!event_queue) {
        fprintf(stderr, "failed to create event_queue!\n");
        al_destroy_display(display);
        al_destroy_timer(timer);
        return -1;
    }

    al_register_event_source(event_queue, al_get_display_event_source(display));

    al_register_event_source(event_queue, al_get_timer_event_source(timer));

    al_clear_to_color(al_map_rgb(0,0,0));

    al_flip_display();

    al_start_timer(timer);
    bool redraw=false;
    grid G = grid(10,10,SCREEN_W,SCREEN_H,0,0);

    while(1)
    {
        ALLEGRO_EVENT ev;
        al_wait_for_event(event_queue, &ev);

        if(ev.type == ALLEGRO_EVENT_TIMER) {
            G.alter();
            redraw=true;
        }

        else if(ev.type == ALLEGRO_EVENT_DISPLAY_CLOSE) {
            break;
        }

        if(redraw && al_is_event_queue_empty(event_queue)) {
            redraw = false;
            al_clear_to_color(al_map_rgb(0,0,0));
            G.draw();
            al_flip_display();
        }
    }

    al_destroy_timer(timer);
    al_destroy_display(display);
    al_destroy_event_queue(event_queue);

    return 0;
}
