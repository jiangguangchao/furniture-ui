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
      {{ localOrder.id }}
    </el-descriptions-item>

    <el-descriptions-item label="总金额">
      {{ localOrder.totalMoney }} 元
    </el-descriptions-item>

    <el-descriptions-item label="已支付金额">
      {{ localOrder.paidMoney }} 元
    </el-descriptions-item>

    <el-descriptions-item label="订单状态">
      <dict-tag :options="order_status" :value="localOrder.orderStatus" />
    </el-descriptions-item>

    <el-descriptions-item label="下单时间">
      {{ parseTime(localOrder.orderTime) }}
    </el-descriptions-item>

    <el-descriptions-item label="下单人">
      {{ localOrder.orderUser }}
    </el-descriptions-item>

    <el-descriptions-item label="联系电话">
      {{ localOrder.phoneNumber }}
    </el-descriptions-item>

    <!-- <el-descriptions-item label="区县">
      {{ order.district }}
    </el-descriptions-item> -->

    <el-descriptions-item label="乡镇">
      {{ districtsStore.getNameByCode(localOrder.town) }}
    </el-descriptions-item>

    <el-descriptions-item label="村委">
      {{ districtsStore.getNameByCode(localOrder.village) }}
    </el-descriptions-item>

    <el-descriptions-item label="几队">
      {{ localOrder.dui || '-' }}
    </el-descriptions-item>

    <el-descriptions-item label="村庄">
      {{ localOrder.subVillage || '-' }}
    </el-descriptions-item>

    <el-descriptions-item label="创建时间">
      {{ parseTime(localOrder.createTime) }}
    </el-descriptions-item>

    <el-descriptions-item label="创建人">
      {{ localOrder.createUser }}
    </el-descriptions-item>

    <el-descriptions-item label="备注">
      <p>{{ localOrder.remark || '-' }}</p>
    </el-descriptions-item>
  </el-descriptions>

  <el-dialog title="修改订单" v-model="open" width="500px" destroy-on-close append-to-body>
    <orderEdit :order="order" />
  </el-dialog>

</template>

<script setup>
import { ref, computed } from 'vue';
import { ElTag, ElButton } from 'element-plus';
import useDistrictsStore from "@/store/modules/districts";
import orderEdit from "./orderEdit";
import { eventBus } from "@/utils/eventBus";
import { getFurnitureOrder } from '@/api/order/furnitureOrder';

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
var localOrder = reactive({});

watch(() => props.order, () => {
  // console.log("watch order", props.order);
  assignNewObj(props.order)
});
assignNewObj(props.order)

/** 修改按钮操作 */
function handleUpdate() {
  open.value = true;
}

function assignNewObj(newObj) {
  Object.assign(localOrder, newObj);
  console.log("localOrder", localOrder);
}

function getById() {
  console.log("根据id查询订单信息， id:", props.order.id)
  getFurnitureOrder(props.order.id).then(response => {
    console.log(response);
    // props.order = response.data;
    // console.log("order:", props.order)
    localOrder.value = { ...response.data }
  })
}

function closeEditDlg() {
  open.value = false;
}


onMounted(() => {
  eventBus.on('FO:orderUpdated', getById);
  eventBus.on('FO:orderUpdated', closeEditDlg);
  eventBus.on('FO:closeEditDlg', closeEditDlg);

});

onUnmounted(() => {
  eventBus.off('FO:orderUpdated', getById);
  eventBus.off('FO:orderUpdated', closeEditDlg);
  eventBus.off('FO:closeEditDlg', closeEditDlg);
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