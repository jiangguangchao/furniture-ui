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

// 根据指定日期统计
export function statcByDate(data) {
  return request({
    url: '/statistics/orderStatistics',
    method: 'post',
    data: data
  })
}

