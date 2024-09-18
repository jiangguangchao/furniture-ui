<template>
  <el-descriptions
    class="margin-top"
    title="订单详情"
    :column="2"
    size="default"
    border
  >
    <template #extra>
      <el-button type="primary">操作</el-button>
    </template>

    <el-descriptions-item label="订单ID">
      {{ order.id }}
    </el-descriptions-item>

    <el-descriptions-item label="总金额">
      {{ order.total_money }} 元
    </el-descriptions-item>

    <el-descriptions-item label="已支付金额">
      {{ order.paid_money }} 元
    </el-descriptions-item>

    <el-descriptions-item label="订单状态">
      <el-tag :type="orderStatusType(order.order_status)" size="small">
        {{ orderStatusText(order.order_status) }}
      </el-tag>
    </el-descriptions-item>

    <el-descriptions-item label="下单时间">
      {{ formatDateTime(order.order_time) }}
    </el-descriptions-item>

    <el-descriptions-item label="下单人">
      {{ order.order_user }}
    </el-descriptions-item>

    <el-descriptions-item label="联系电话">
      {{ order.phone_number }}
    </el-descriptions-item>

    <el-descriptions-item label="区县">
      {{ order.district }}
    </el-descriptions-item>

    <el-descriptions-item label="乡镇">
      {{ order.town }}
    </el-descriptions-item>

    <el-descriptions-item label="村委">
      {{ order.village }}
    </el-descriptions-item>

    <el-descriptions-item label="几队">
      {{ order.dui || '无' }}
    </el-descriptions-item>

    <el-descriptions-item label="村庄">
      {{ order.sub_village || '无' }}
    </el-descriptions-item>

    <el-descriptions-item label="创建时间">
      {{ formatDateTime(order.create_time) }}
    </el-descriptions-item>

    <el-descriptions-item label="创建人">
      {{ order.create_user }}
    </el-descriptions-item>

    <el-descriptions-item label="备注">
      <el-tag v-if="order.remark" size="small" type="info">{{ order.remark }}</el-tag>
      <span v-else>无</span>
    </el-descriptions-item>
  </el-descriptions>
</template>

<script setup>
import { ref, computed } from 'vue';
import { ElTag, ElButton } from 'element-plus';

// 接收 props
const props = defineProps({
  order: {
    type: Object,
    required: true,
  },
});

// 订单状态文本映射
const orderStatusText = (status) => {
  const statusMap = {
    '0': '未开始',
    '1': '待配送',
    '2': '配送中',
    '3': '已配送',
    '5': '已完成',
    '10': '已取消',
  };
  return statusMap[status] || '未知状态';
};

// 订单状态类型映射
const orderStatusType = (status) => {
  const typeMap = {
    '0': 'warning',
    '1': 'info',
    '2': 'info',
    '3': 'success',
    '5': 'success',
    '10': 'danger',
  };
  return typeMap[status] || 'info';
};

// 格式化日期时间
const formatDateTime = (dateTime) => {
  if (!dateTime) return '';
  const date = new Date(dateTime);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};
</script>

<style scoped>
.margin-top {
  margin-top: 20px;
}
.cell-item {
  display: flex;
  align-items: center;
}
.cell-item .el-icon {
  margin-right: 8px;
}
</style>