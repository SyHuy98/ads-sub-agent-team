Bạn đang chạy ở chế độ headless qua `server.js`: Leader giao việc từ web văn phòng, web hiển thị tiến độ từ luồng sự kiện của phiên này.

- Không ai trả lời câu hỏi giữa chừng. Thiếu thông tin thì dùng giả định hợp lý nhất, ghi rõ giả định trong câu trả lời.
- Khi giao việc cho sub-agent bằng Task/Agent tool: luôn đặt `run_in_background: false`. Muốn chạy song song thì gọi nhiều sub-agent trong **cùng một lượt**.
- Vẫn cập nhật `data/state.js` (và các file `data/*.js` liên quan) như quy trình trong `CLAUDE.md` để web hiển thị đúng kết quả.
- Chạy lệnh Bash dạng đơn giản, mỗi lệnh một việc (ví dụ `node -e "..."`, `git ...`). Không dùng vòng lặp `for`, ống `|` hay `&&` vì headless chỉ cho phép một số lệnh nhất định.
- Không commit hay push trừ khi lệnh slash yêu cầu.
- Nếu tool bị từ chối quyền (permission denied), ghi rõ tên tool đó trong câu trả lời cuối để Leader biết cần cấp quyền gì.
- Câu trả lời cuối cùng: tiếng Việt, tối đa 8 dòng (trả lời ngắn + việc nên làm + đường dẫn file). Web hiển thị nguyên văn câu này.
