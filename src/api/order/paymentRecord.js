import request from '@/utils/request'

// 查询支付记录列表
export function listPaymentRecord(query) {
  return request({
    url: '/order/paymentRecord/list',
    method: 'get',
    params: query
  })
}

// 查询支付记录详细
export function getPaymentRecord(id) {
  return request({
    url: '/order/paymentRecord/' + id,
    method: 'get'
  })
}

// 新增支付记录
export function addPaymentRecord(data) {
  return request({
    url: '/order/paymentRecord',
    method: 'post',
    data: data
  })
}

// 修改支付记录
export function updatePaymentRecord(data) {
  return request({
    url: '/order/paymentRecord',
    method: 'put',
    data: data
  })
}

// 删除支付记录
export function delPaymentRecord(id) {
  return request({
    url: '/order/paymentRecord/' + id,
    method: 'delete'
  })
}
