import asyncio

class SmtpServerProtocol(asyncio.Protocol):
    def connection_made(self, transport):
        self.transport = transport
        self.transport.write(b"220 localhost ESMTP Mock\r\n")
        self.data_mode = False

    def data_received(self, data):
        if self.data_mode:
            if b"\r\n.\r\n" in data or data == b".\r\n":
                self.data_mode = False
                self.transport.write(b"250 2.0.0 OK: message queued\r\n")
            return

        line = data.decode("utf-8", errors="ignore").strip()
        cmd = line[:4].upper()
        if cmd in ("HELO", "EHLO"):
            self.transport.write(b"250-localhost\r\n250 HELP\r\n")
        elif cmd == "MAIL":
            self.transport.write(b"250 2.1.0 OK\r\n")
        elif cmd == "RCPT":
            self.transport.write(b"250 2.1.5 OK\r\n")
        elif cmd == "DATA":
            self.data_mode = True
            self.transport.write(b"354 End data with <CR><LF>.<CR><LF>\r\n")
        elif cmd == "QUIT":
            self.transport.write(b"221 2.0.0 Bye\r\n")
            self.transport.close()
        elif cmd == "RSET":
            self.transport.write(b"250 2.0.0 OK\r\n")
        elif cmd == "NOOP":
            self.transport.write(b"250 2.0.0 OK\r\n")
        else:
            self.transport.write(b"250 OK\r\n")

async def main():
    loop = asyncio.get_running_loop()
    server = await loop.create_server(SmtpServerProtocol, "127.0.0.1", 1025)
    print("Mock SMTP server listening on 127.0.0.1:1025")
    async with server:
        await server.serve_forever()

if __name__ == "__main__":
    asyncio.run(main())
