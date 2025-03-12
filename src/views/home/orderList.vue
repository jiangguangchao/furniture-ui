<template>
  <el-card class="box-card" shadow="hover">
    <template #header>
      <div class="card-header">
        <el-collapse v-model="activeNames" style="width: 100%; border: 0; border-bottom: 0;">
          <el-collapse-item title="未完成订单" name="1">
            <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px"
              class="search-form">
              <el-form-item label="订单编号" prop="id">
                <el-input v-model="queryParams.id" placeholder="请输入订单编号" clearable @keyup.enter="handleQuery" />
              </el-form-item>
              <el-form-item label="订单状态" prop="orderStatus" style="width: 200px">
                <el-select v-model="queryParams.orderStatus" placeholder="请选择订单状态" clearable>
                  <el-option v-for="dict in order_status" :key="dict.value" :label="dict.label" :value="dict.value" />
                </el-select>
              </el-form-item>
              <el-form-item label="支付状态" prop="paymentStatus" style="width: 200px">
                <el-select v-model="queryParams.paymentStatus" placeholder="请选择支付状态" clearable>
                  <el-option v-for="dict in order_payment_status" :key="dict.value" :label="dict.label"
                    :value="dict.value" />
                </el-select>
              </el-form-item>
              <el-form-item label="配送状态" prop="deliveryStatus" style="width: 200px">
                <el-select v-model="queryParams.deliveryStatus" placeholder="请选择配送状态" clearable>
                  <el-option v-for="dict in order_delivery_status" :key="dict.value" :label="dict.label"
                    :value="dict.value" />
                </el-select>
              </el-form-item>
              <el-form-item label="下单时间" style="width: 308px">
                <el-date-picker v-model="daterangeOrderTime" value-format="YYYY-MM-DD" type="daterange"
                  range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期"></el-date-picker>
              </el-form-item>
              <el-form-item label="下单人" prop="orderUser">
                <el-input v-model="queryParams.orderUser" placeholder="请输入下单人" clearable @keyup.enter="handleQuery" />
              </el-form-item>
              <el-form-item label="联系电话" prop="phoneNumber">
                <el-input v-model="queryParams.phoneNumber" placeholder="请输入联系电话" clearable
                  @keyup.enter="handleQuery" />
              </el-form-item>
              <el-form-item label="乡镇" prop="town" style="width: 200px">
                <el-select v-model="queryParams.town" placeholder="请选择乡镇" clearable>
                  <el-option v-for="t in townArr" :key="t.code" :label="t.name" :value="t.code" />
                </el-select>
              </el-form-item>
              <el-form-item label="村委" prop="village" style="width: 200px">
                <el-select v-model="queryParams.village" placeholder="请选择村委" clearable>
                  <el-option v-for="t in villageArr" :key="t.code" :label="t.name" :value="t.code" />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
              </el-form-item>
            </el-form>
          </el-collapse-item>
        </el-collapse>

      </div>
    </template>
    <el-table v-loading="loading" :data="furnitureOrderList">
      <el-table-column label="地址" align="center">
        <template #default="scope">
          <span>{{ formatAddress(scope.row) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="下单人" align="center" prop="orderUser" />
      <el-table-column label="联系电话" align="center" prop="phoneNumber" />
      <el-table-column label="总金额" align="center" prop="totalMoney" />


      <el-table-column label="已支付金额" align="center" prop="paidMoney" />
      <el-table-column label="订单状态" align="center" prop="orderStatus">
        <template #default="scope">
          <dict-tag :options="order_status" :value="scope.row.orderStatus" />
        </template>
      </el-table-column>
      <el-table-column label="支付状态" align="center" prop="paymentStatus">
        <template #default="scope">
          <dict-tag :options="order_payment_status" :value="scope.row.paymentStatus" />
        </template>
      </el-table-column>
      <el-table-column label="配送状态" align="center" prop="deliveryStatus">
        <template #default="scope">
          <dict-tag :options="order_delivery_status" :value="scope.row.deliveryStatus" />
        </template>
      </el-table-column>
      <el-table-column label="订单编号" align="center" prop="id" />
      <el-table-column label="下单时间" align="center" prop="orderTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.orderTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleDetail(scope.row)">详情</el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-card>


  <!-- 订单详情 -->
  <el-dialog :title="detailTitle" v-model="detailOpen" width="800px" append-to-body>
    <detailTab :order="currentOrder" />
  </el-dialog>

</template>


<script setup name="FurnitureOrder">
import {
  listFurnitureOrder,
} from "@/api/order/furnitureOrder";
import detailTab from "@/views/order/furnitureOrder/detailTab.vue"
import useDistrictsStore from "@/store/modules/districts";
import { eventBus } from "@/utils/eventBus";

const districtsStore = useDistrictsStore();
const { proxy } = getCurrentInstance();
const { order_status } = proxy.useDict("order_status");
const { order_delivery_status } = proxy.useDict("order_delivery_status");
const { order_payment_status } = proxy.useDict("order_payment_status");

const furnitureOrderList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const daterangeOrderTime = ref([]);
const defaultTime = new Date(2000, 1, 1, 12, 0, 0);
const detailOpen = ref(false);
const detailTitle = ref("订单详情");
const currentOrder = ref({});

const data = reactive({
  form: {
    orderStatus: "1"
  },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    id: null,
    totalMoney: null,
    orderStatus: '1',
    orderTime: null,
    orderUser: null,
    phoneNumber: null,
    town: null,
    village: null,
  },
  rules: {
    orderStatus: [
      { required: true, message: "订单状态不能为空", trigger: "change" },
    ],
    orderUser: [{ required: true, message: "下单人不能为空", trigger: "blur" }],
    phoneNumber: [
      { required: true, message: "联系电话不能为空", trigger: "blur" },
    ],
  },
});

const { queryParams, form, rules } = toRefs(data);

const activeNames = ref([''])
const isOverlayVisible = ref(false);

function getList() {
  loading.value = true;
  queryParams.value.params = {};
  if (null != daterangeOrderTime && "" != daterangeOrderTime) {
    queryParams.value.params["beginOrderTime"] = daterangeOrderTime.value[0];
    queryParams.value.params["endOrderTime"] = daterangeOrderTime.value[1];
  }
  listFurnitureOrder(queryParams.value).then((response) => {
    furnitureOrderList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

function handleDetail(row) {
  currentOrder.value = row;
  detailOpen.value = true;
}

/** 搜索按钮操作 */
function handleQuery() {
  activeNames.value = ['']
  queryParams.value.pageNum = 1;
  getList();
}

function formatAddress(row) {
  //如果是庙湾镇[411723103]的。不显示镇，只显示镇下面的地址
  var address = districtsStore.getNameByCode(row.village) + (row.dui ? row.dui + "队" : "") + row.subVillage;
  if (row.town != "411723103") {
    address = districtsStore.getNameByCode(row.town) + address;
  }
  return address;
}

function showSearchForm() {
}
getList();
</script>

<style scoped>
/* .home {
  padding: 20px;
} */

.box-card {
  /* height: 300px; */
  border: 2px solid #637a71;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* .text {
  font-size: 14px;
}

.item {
  margin-bottom: 18px;
} */

</style>