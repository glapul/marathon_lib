/*
 * --=[ CTcpFwd:
 *    A cross platform STDIN/STDOUT ---> Socket forwarding engine
 *
 * Author: j00ru//vx
 * Date:   2010-04-03
 * E-mail: j00ru.vx@gmail.com
 * WWW:    http://j00ru.vexillium.org/
 *
 * LICENSE
 * Permission is hereby granted to use, copy, modify, and distribute this source code, 
 * or portions hereof, documentation and executables, for any purpose, without fee, 
 * subject to the following restrictions:
 * 
 * 1. The origin of this source code must not be misrepresented.
 *
 * 2. Altered versions must be plainly marked as such and must not be misrepresented 
 *    as being the original source.
 *
 * 3. This Copyright notice may not be removed or altered from any source or altered 
 *    source distribution.
 * 
 * This software is provided "AS IS". The author does not guarantee that this program works 
 * or is bug-free. The author takes no responsibility for any damage caused by this program.
 * Use at your own risk.
 */
#include <cstdio>
#include <cstdlib>
#include <string>
#include "CTcpFwd.h"
using namespace std;

char buffer[4096];

int main()
{
  CTcpFwd Sock("Google","google.com",80);

  puts("Sending a request...");

  Sock.SwitchStdout("Google");
  printf("GET http://www.google.com/ HTTP/1.1\n"
         "Host: http://www.google.com/\n\n");

  Sock.SwitchStdout("DefaultStdout");
  Sock.SwitchStdin("Google");
  while(fgets(buffer,sizeof(buffer),stdin))
    printf("%s",buffer);

  return 0;
}

