import request from '@/utils/request'

// 查询家具订单列表
export function listFurnitureOrder(query) {
  return request({
    url: '/order/furnitureOrder/list',
    method: 'get',
    params: query
  })
}

// 查询家具订单详细
export function getFurnitureOrder(id) {
  return request({
    url: '/order/furnitureOrder/' + id,
    method: 'get'
  })
}

// 新增家具订单
export function addFurnitureOrder(data) {
  return request({
    url: '/order/furnitureOrder',
    method: 'post',
    data: data
  })
}

// 修改家具订单
export function updateFurnitureOrder(data) {
  return request({
    url: '/order/furnitureOrder',
    method: 'put',
    data: data
  })
}

// 删除家具订单
export function delFurnitureOrder(id) {
  return request({
    url: '/order/furnitureOrder/' + id,
    method: 'delete'
  })
}
