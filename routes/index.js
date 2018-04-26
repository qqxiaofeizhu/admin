const express = require('express');
const router = express.Router();
/**
 * 中间件处理
 */
const middleware = require('../middleware/entryAllOrigin');
const token = require('../middleware/checkToken');
const list = require('./list');
const users = require('./users');
const notices = require('./notice');
router.all('*', middleware.entryAllOrigin);


//  登录接口
router.post('/login', users.Login);
// 注册接口
router.post('/register', users.register)
// 查看所有管理员
router.get('/get-user-message', token.checkToken, users.getUserMessage);
router.get('/get-all-management-personnel', token.checkToken, users.getAllManagementPersonnel)
// 删除用户
router.post('/delete-users', token.checkToken, users.deleteUsers);
// 设置为超级管理员
router.post('/set-ordinary-to-super',token.checkToken,  users.setOrdinaryToSuper);
// 修改密码
router.post('/change-user-password', users.ChangeUserPassword);
// 还书
router.post('/return-the-book', token.checkToken, users.ReturnTheBook);
// 所有借阅书籍
router.get('/get-user-all-borrow-books', token.checkToken, users.getUserAllBorrowBooks);

// 获取录入数据接口
router.get('/get-all-book-entry', list.getAllBookEntry);
// 添加图书接口
router.post('/add-book-list', list.addBookList);
router.post('/get-book-list', list.getBookList);
// 删除图书接口
router.post('/delate-booklist-by-id', token.checkToken, list.delateBooklistById);
// 编辑图书接口
router.post('/editor-select-book-name', token.checkToken,  list.editorSelectBookName);
// 借阅
router.post('/borrowing-by-id', token.checkToken, list.borrowingById);


// 新增公告
router.post('/add-notice', token.checkToken, notices.addNotice);
router.get('/get-all-notice', notices.getAllNotice);
router.post('/delete-notice-by-id', token.checkToken, notices.deleteNoticeById);
router.get('/get-notice-by-id', token.checkToken, notices.getNoticeById);
module.exports = router;
