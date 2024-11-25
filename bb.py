from selenium import webdriver
from selenium.webdriver.common.by import By
import time
from packaging import version
import requests
from bs4 import BeautifulSoup

# FOFA 查询页面基础 URL
BASE_URL = "https://fofa.info/result?qbase64=aWNvbl9oYXNoPSItMTM1NDAyNzMxOSIgJiYgYXNuPSIxMzMzNSIgJiYgcG9ydD0iNDQzIg%3D%3D"

# 文件名定义
OUTPUT_FILE_1 = "1.txt"
OUTPUT_FILE_2 = "2.txt"
OUTPUT_FILE_OK = "OK.txt"

def init_browser():
    """初始化 Selenium 浏览器"""
    options = webdriver.ChromeOptions()
    options.add_argument("--headless")  # 无头模式
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    driver = webdriver.Chrome(options=options)
    return driver

def get_fofa_results(start_page, end_page):
    """使用 Selenium 抓取 FOFA 页面并提取结果地址"""
    print(f"正在抓取 FOFA 页面，从第 {start_page} 页到第 {end_page} 页...")
    results = []
    driver = init_browser()

    for page in range(start_page, end_page + 1):
        print(f"正在抓取第 {page} 页...")
        driver.get(f"{BASE_URL}&page={page}")
        time.sleep(3)  # 等待页面加载

        # 查找页面中结果的链接（通过具体的 class 筛选结果链接）
        elements = driver.find_elements(By.CSS_SELECTOR, "a[href^='https://']")
        for elem in elements:
            url = elem.get_attribute("href")
            if url not in results:
                results.append(url)

    driver.quit()
    print(f"总共提取到 {len(results)} 个地址")
    return results

def append_login_to_urls(input_file, output_file):
    """将地址加上 /login 并保存到新文件"""
    print(f"正在处理 {input_file}，将地址加上 /login 并保存到 {output_file}...")
    with open(input_file, "r", encoding="utf-8") as infile, open(output_file, "w", encoding="utf-8") as outfile:
        for line in infile:
            url = line.strip() + "/login"
            outfile.write(url + "\n")
    print(f"已完成地址追加，结果保存到 {output_file}")

def check_bpb_version(input_file, output_file):
    """访问地址并检查 BPB Panel 的版本号"""
    print(f"正在验证 {input_file} 中的地址...")
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
    }
    min_version = version.parse("2.5.3")  # 最低版本号
    with open(input_file, "r", encoding="utf-8") as infile, open(output_file, "w", encoding="utf-8") as outfile:
        for line in infile:
            url = line.strip()
            try:
                response = requests.get(url, headers=headers, timeout=10)
                if response.status_code == 200 and "BPB Panel" in response.text:
                    # 提取版本号
                    raw_version = extract_version(response.text)
                    if raw_version:
                        parsed_version = version.parse(raw_version)
                        if parsed_version > min_version:
                            print(f"[匹配] {url} (版本号: {parsed_version})")
                            outfile.write(url + "\n")
            except Exception as e:
                print(f"[错误] 无法访问 {url}，错误：{e}")
    print(f"验证完成，符合条件的地址保存到 {output_file}")

def extract_version(html):
    """从 HTML 内容中提取 BPB Panel 的版本号"""
    if "BPB Panel" in html:
        start_index = html.find("BPB Panel")
        # 提取版本号（假设版本号以 2 开头）
        version_start = html.find("2", start_index)
        version_end = version_start
        while version_end < len(html) and (html[version_end].isdigit() or html[version_end] == "."):
            version_end += 1
        return html[version_start:version_end]
    return None

def main():
    # 配置分页范围
    start_page = 1  # 起始页码
    end_page = 5    # 结束页码

    # 第一步：抓取 FOFA 页面结果并保存到 1.txt
    urls = get_fofa_results(start_page, end_page)
    with open(OUTPUT_FILE_1, "w", encoding="utf-8") as f:
        for url in urls:
            f.write(url + "\n")
    print(f"FOFA 页面结果已保存到 {OUTPUT_FILE_1}")

    # 第二步：将 1.txt 地址加上 /login 并保存到 2.txt
    append_login_to_urls(OUTPUT_FILE_1, OUTPUT_FILE_2)

    # 第三步：验证 2.txt 中的地址，符合条件的保存到 OK.txt
    check_bpb_version(OUTPUT_FILE_2, OUTPUT_FILE_OK)

if __name__ == "__main__":
    main()