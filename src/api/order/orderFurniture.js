import request from '@/utils/request'

// 查询订单中家具列表
export function listOrderFurniture(query) {
  return request({
    url: '/order/orderFurniture/list',
    method: 'get',
    params: query
  })
}

// 查询订单中家具详细
export function getOrderFurniture(id) {
  return request({
    url: '/order/orderFurniture/' + id,
    method: 'get'
  })
}

// 新增订单中家具
export function addOrderFurniture(data) {
  return request({
    url: '/order/orderFurniture',
    method: 'post',
    data: data
  })
}

// 修改订单中家具
export function updateOrderFurniture(data) {
  return request({
    url: '/order/orderFurniture',
    method: 'put',
    data: data
  })
}

// 删除订单中家具
export function delOrderFurniture(id) {
  return request({
    url: '/order/orderFurniture/' + id,
    method: 'delete'
  })
}
