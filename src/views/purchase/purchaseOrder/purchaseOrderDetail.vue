<template>
  <el-descriptions class="margin-top" title="进货单详情" :column="2" size="default" border>
    <template #extra>
      <el-button type="primary">刷新</el-button>
      <el-button type="primary" @click="handleUpdate()">修改</el-button>
    </template>

    <el-descriptions-item label="供货方">
      {{ purchaseOrder.supplier }}
    </el-descriptions-item>

    <el-descriptions-item label="订货时间">
      {{ parseTime(purchaseOrder.purchaseDate) }}
    </el-descriptions-item>

    <el-descriptions-item label="到货状态">
      <dict-tag :options="purchase_arrival_status" :value="purchaseOrder.arrivalStatus" />
    </el-descriptions-item>

    <el-descriptions-item label="总金额">
      {{ purchaseOrder.totalAmount }} 元
    </el-descriptions-item>

    <el-descriptions-item label="已支付金额">
      {{ purchaseOrder.paidMoney }} 元
    </el-descriptions-item>


    <el-descriptions-item label="手机">
      {{ purchaseOrder.phone }}
    </el-descriptions-item>

    <el-descriptions-item label="微信">
      {{ purchaseOrder.weichat }}
    </el-descriptions-item>

    <el-descriptions-item label="创建时间">
      {{ parseTime(purchaseOrder.createTime) }}
    </el-descriptions-item>

    <el-descriptions-item label="创建人">
      {{ purchaseOrder.createUser }}
    </el-descriptions-item>

    <el-descriptions-item label="备注">
      <p>{{ purchaseOrder.remark || '-' }}</p>
    </el-descriptions-item>
  </el-descriptions>
</template>

<script setup>

const { proxy } = getCurrentInstance();
const { purchase_arrival_status } = proxy.useDict("purchase_arrival_status");

// 接收 props
const props = defineProps({
  purchaseOrder: {
    type: Object,
    required: true,
  },
});

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