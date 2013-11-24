SRC 	= test.cpp CTcpFwd.cpp
OBJ 	= $(SRC:.cpp=.o)
OUT 	= test
CFLAGS 	= -Wall -pedantic
GCC 	= g++
NONUSED = 

$(OUT): $(OBJ)
	$(GCC) $(CFLAGS) $(OBJ) -o $(OUT)

%.o: %.cpp
	$(GCC) $(CFLAGS) $< -c -o $@

clean:
	rm $(OBJ)




