import request from '@/utils/request'

// 查询订单统计列表
export function listOrderStatistics(query) {
  return request({
    url: '/statistics/orderStatistics/list',
    method: 'get',
    params: query
  })
}

// 查询订单统计详细
export function getOrderStatistics(id) {
  return request({
    url: '/statistics/orderStatistics/' + id,
    method: 'get'
  })
}

// 新增订单统计
export function addOrderStatistics(data) {
  return request({
    url: '/statistics/orderStatistics',
    method: 'post',
    data: data
  })
}

// 修改订单统计
export function updateOrderStatistics(data) {
  return request({
    url: '/statistics/orderStatistics',
    method: 'put',
    data: data
  })
}

// 删除订单统计
export function delOrderStatistics(id) {
  return request({
    url: '/statistics/orderStatistics/' + id,
    method: 'delete'
  })
}
