const promptCollections = {
  short: [
    'We\'ll start with some short questions. Just read each sentence as it appears, then press "Next".',
    'xin chào, bạn tên là gì ?',
    'cuối cùng cũng trở lại à?',
    'bạn thường xuyên đi du lịch à?',
    'không rõ pháp luật à?'
  ],
  numbers: [
    'Now some numbers. As before, read each sentence as it appears, then press "Next".',
    'Một. Hai. Ba. Bốn. Tư. Năm. Sáu. Bẩy. Bảy. Tám. Chín.',
    'Mười. Mười một. Mười hai. Mười ba. Mười bốn. Mười lăm. Mười sáu. Mười bảy. Mười tám. Mười Chín.'
  ],
  podcast: [
    'The following sentences are longer. Please read them as naturally as you can.',
    'hế lô xin chào mọi người đã đến với nhật ký của ai chứ không phải của tui',
    'và hôm nay nãy giờ thì em ý cười hoài, không biết tại sao nói chuyện không có được, nên là tui mạn phép là xin được mượn lời của em ý dẫn chuyện cho câu chuyện ngày hôm nay',
    'nói chuyện đi em cười hoài vậy em',
    'em thấy nó mắc cười thôi, chị thấy là mình cười nãy giờ từ trước khi vô số rồi đó'
  ],
  tongdai: [
    'Let\'s see your acting skills... For the following sentences, pretend you\'re a call center operator.',
    'Xin lỗi, em không nghe rõ thông tin từ anh. Vui lòng giữ máy, cuộc gọi sẽ được chuyển đến tổng đài viên.',
    'Cám ơn anh Minh đã dành thời gian nghe điện thoại và tin tưởng lựa chọn dịch vụ bên em làm bạn đồng hành . Chúc anh ngày làm việc vui vẻ . Em xin phép gác máy.',
    'Cho em hỏi số điện thoại này của anh chị hay đang bắt máy giúp người khác ạ?',
    'Dạ cám ơn thông tin chị đã cung cấp . Em xin lỗi vì đã làm phiền . Chúc chị một ngày tốt lành . Xin chào chị.'
  ],
  happy: [
    'Now, please pronounce the following sentences with a happy intonation.', 
    'Không thể tin nổi, tuyệt cú mèo',
    'Mọi thứ diễn ra quá là suôn sẻ, tuyệt vời',
    'Mẹ ơi, con đỗ rồi, con đỗ đại học rồi',
    'Nhóm chúng con ai cũng đỗ ạ'
  ],
  angry: [
    'Let\'s change: please pronounce the following sentences as if you were angry.', 
    'Không thể chấp nhận nổi',
    'Chuyện quái gì thế này',
    'Im đi, tôi mệt mỏi quá rồi',
    'Không thể chịu nổi nữa, anh làm cái quái gì vậy'
  ],
  sad: [
    'And finally... Time to sound sad.', 
    'Dừng lại đi, tôi mệt mỏi quá rồi',
    'Mệt thế nhỉ, oải vãi',
    'Thất bại rồi, tôi muốn bỏ cuộc',
    'Rất nhiều người đã nằm lại dưới đống bùn đất đó'
  ]
};
