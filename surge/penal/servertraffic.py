#!/usr/bin/env python3
# Sestea

import http.server
import socketserver
import json
import time
import psutil

port = 37122   # 自定义端口 和 surge penal 的端口保持一致


class RequestHandler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header("Content-type", "application/json")
        self.end_headers()

        time.sleep(1)

        cpu_usage = int(psutil.cpu_percent(interval=None))
        mem_usage = int(psutil.virtual_memory().percent)
        bytes_sent = psutil.net_io_counters().bytes_sent
        bytes_recv = psutil.net_io_counters().bytes_recv
        bytes_total = bytes_sent + bytes_recv

        uptime_seconds = int(time.time() - psutil.boot_time())
        uptime_hours, uptime_seconds = divmod(uptime_seconds, 3600)
        uptime_minutes, uptime_seconds = divmod(uptime_seconds, 60)

        last_time = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())

        response_dict = {
            "cpu_usage": cpu_usage,
            "mem_usage": mem_usage,
            "uptime": f"{uptime_hours}h {uptime_minutes}m",
            "bytes_sent": str(bytes_sent),
            "bytes_recv": str(bytes_recv),
            "bytes_total": str(bytes_total),
            "last_time": last_time,
        }

        response_json = json.dumps(response_dict).encode("utf-8")
        self.wfile.write(response_json)


with socketserver.ThreadingTCPServer(("", port), RequestHandler) as httpd:
    try:
        print(f"Serving at port {port}")
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("KeyboardInterrupt is captured, program exited")
