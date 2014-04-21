CXXFLAGS= -O2 -std=c++0x -pthread
LIBS= allegro-5.0 allegro_image-5 allegro_primitives-5 allegro_ttf-5
TCPS= wrapper.cpp CTcpFwd.cpp
BOOSTS= -L/usr/local/lib -lboost_wserialization -lboost_serialization
% : %.cpp
	g++ $(CXXFLAGS) $^  `pkg-config --libs $(LIBS)` $(TCPS) $(BOOSTS) -o $@
