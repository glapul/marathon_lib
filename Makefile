CFLAGS= -std=c++0x -O2

arm:
	g++ -o arm arm.cpp wrapper.cpp CTcpFwd.cpp $(CFLAGS)
cry:
	g++ -o cry cry.cpp wrapper.cpp CTcpFwd.cpp $(CFLAGS)
wat:
	g++ -o wat wat.cpp wrapper.cpp CTcpFwd.cpp $(CFLAGS)
