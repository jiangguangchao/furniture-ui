<template>
  <el-descriptions
    class="margin-top"
    title="订单详情"
    :column="2"
    size="default"
    border
  >
    <template #extra>
      <el-button type="primary">刷新</el-button>
      <el-button type="primary" @click="handleUpdate()">修改</el-button>
    </template>

    <el-descriptions-item label="订单ID">
      {{ order.id }}
    </el-descriptions-item>

    <el-descriptions-item label="总金额">
      {{ order.totalMoney }} 元
    </el-descriptions-item>

    <el-descriptions-item label="已支付金额">
      {{ order.paidMoney }} 元
    </el-descriptions-item>

    <el-descriptions-item label="订单状态">
      <dict-tag :options="order_status" :value="order.orderStatus" />
    </el-descriptions-item>

    <el-descriptions-item label="下单时间">
      {{ parseTime(order.orderTime) }}
    </el-descriptions-item>

    <el-descriptions-item label="下单人">
      {{ order.orderUser }}
    </el-descriptions-item>

    <el-descriptions-item label="联系电话">
      {{ order.phoneNumber }}
    </el-descriptions-item>

    <!-- <el-descriptions-item label="区县">
      {{ order.district }}
    </el-descriptions-item> -->

    <el-descriptions-item label="乡镇">
      {{ districtsStore.getNameByCode(order.town) }}
    </el-descriptions-item>

    <el-descriptions-item label="村委">
      {{ districtsStore.getNameByCode(order.village) }}
    </el-descriptions-item>

    <el-descriptions-item label="几队">
      {{ order.dui || '-' }}
    </el-descriptions-item>

    <el-descriptions-item label="村庄">
      {{ order.sub_village || '-' }}
    </el-descriptions-item>

    <el-descriptions-item label="创建时间">
      {{ parseTime(order.createTime) }}
    </el-descriptions-item>

    <el-descriptions-item label="创建人">
      {{ order.createUser }}
    </el-descriptions-item>

    <el-descriptions-item label="备注">
      <p>{{ order.remark || '-' }}</p>
    </el-descriptions-item>
  </el-descriptions>

  <el-dialog title="修改订单" v-model="open" width="500px" append-to-body>
    <orderEdit :order="order" />
  </el-dialog>

</template>

<script setup>
import { ref, computed } from 'vue';
import { ElTag, ElButton } from 'element-plus';
import useDistrictsStore from "@/store/modules/districts";
import orderEdit from "./orderEdit";

const districtsStore = useDistrictsStore();

const { proxy } = getCurrentInstance();
const { order_status } = proxy.useDict("order_status");
const open = ref(false);

// 接收 props
const props = defineProps({
  order: {
    type: Object,
    required: true,
  },
});

/** 修改按钮操作 */
function handleUpdate() {
  open.value = true;
}


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