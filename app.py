from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/jule', methods=['POST'])
def jule_chat():
    data = request.get_json()
    user_message = data.get('message', '').lower()
    
    # Logika sederhana Jule (Bisa dikembangkan dengan AI sungguhan nantinya)
    response = "Saya di sini untuk mendengarkan. Tarik napas perlahan, apa yang bisa saya bantu agar harimu lebih ringan?"
    
    if 'stres' in user_message or 'pusing' in user_message or 'capek' in user_message:
        response = "Sangat wajar merasa lelah dengan semua beban ini. Coba hentikan pekerjaanmu sejenak, minumlah air atau kopi hangat. Kamu sudah melakukan yang terbaik hari ini. Mari kita urai tugasmu satu per satu agar tidak terlalu berat."
    elif 'sedih' in user_message or 'buruk' in user_message:
        response = "Saya mengerti ini bukan hari yang mudah. Jangan terlalu keras pada dirimu sendiri. Ingatlah bahwa tidak apa-apa untuk beristirahat. Ada hal kecil apa hari ini yang bisa membuatmu sedikit tersenyum?"
    elif 'selesai' in user_message or 'berhasil' in user_message:
        response = "Kerja bagus! Saya sangat bangga padamu. Merayakan kemenangan kecil sangat penting untuk menjaga semangat. Pertahankan ritme ini, tapi jangan lupa istirahat."

    return jsonify({'response': response})

if __name__ == '__main__':
    app.run(debug=True, port=5000)