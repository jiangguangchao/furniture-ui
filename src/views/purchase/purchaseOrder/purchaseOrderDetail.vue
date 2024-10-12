<template>


  <el-card class="box-card" shadow="hover">
    <template #header>
      <div class="card-header">
        <span>进货单基本信息</span>
      </div>
    </template>
    <el-descriptions class="margin-top" :column="2" size="default" border>
      <template #extra>
        <el-button type="primary">刷新</el-button>
        <el-button type="primary" @click="handleUpdate()">修改</el-button>
      </template>

      <el-descriptions-item label="供货方">
        {{ copyOrder.supplier }}
      </el-descriptions-item>

      <el-descriptions-item label="订货时间">
        {{ parseTime(copyOrder.purchaseDate) }}
      </el-descriptions-item>

      <el-descriptions-item label="到货状态">
        <dict-tag :options="purchase_arrival_status" :value="copyOrder.arrivalStatus" />
      </el-descriptions-item>

      <el-descriptions-item label="总金额">
        {{ copyOrder.totalAmount }} 元
      </el-descriptions-item>

      <el-descriptions-item label="已支付金额">
        {{ copyOrder.paidMoney }} 元
      </el-descriptions-item>


      <el-descriptions-item label="手机">
        {{ copyOrder.phone }}
      </el-descriptions-item>

      <el-descriptions-item label="微信">
        {{ copyOrder.weichat }}
      </el-descriptions-item>

      <el-descriptions-item label="创建时间">
        {{ parseTime(copyOrder.createTime) }}
      </el-descriptions-item>

      <el-descriptions-item label="创建人">
        {{ copyOrder.createUser }}
      </el-descriptions-item>

      <el-descriptions-item label="备注">
        <p>{{ copyOrder.remark || '-' }}</p>
      </el-descriptions-item>
    </el-descriptions>
  </el-card>

  <el-card class="box-card" shadow="hover">
    <template #header>
      <div class="card-header">
        <span>清单明细</span>
      </div>
    </template>
    <div class="goods-list">
      <el-button type="primary" @click="handleGoodsAdd" style="margin-bottom: 10px;">新增</el-button>
      <el-table :data="copyOrder.goodsList" style="width: 100%">
        <el-table-column prop="name" label="名称">
        </el-table-column>
        <el-table-column prop="unitPrice" label="单价">
        </el-table-column>
        <el-table-column prop="quantity" label="数量">
        </el-table-column>
        <el-table-column prop="totalPrice" label="总价">
          <template #default="scope">
            {{ scope.row.unitPrice * scope.row.quantity }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100">
          <template #default="scope">
            <el-button size="mini" type="danger" @click="removeGoods(scope.$index)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </el-card>

  <el-card class="box-card" shadow="hover">
    <template #header>
      <div class="card-header">
        <span>图片</span>
      </div>
    </template>
    <ImageUpload :modelValue="fileUrlList" :associationData="associationData"></ImageUpload>
  </el-card>

  <el-dialog title="新增明细" v-model="addGoodsOpen" width="400">
    <el-form ref="goodsFormRef" :model="goodsForm" label-width="80px">
      <el-form-item label="名称" prop="name">
        <el-input v-model="goodsForm.name" placeholder="请输入名称" />
      </el-form-item>
      <el-form-item label="单价" prop="unitPrice">
        <el-input v-model.number="goodsForm.unitPrice" placeholder="请输入单价" />
      </el-form-item>
      <el-form-item label="数量" prop="quantity">
        <el-input v-model.number="goodsForm.quantity" placeholder="请输入数量" />
      </el-form-item>
      <el-form-item label="总价" >
        {{ goodsForm.unitPrice * goodsForm.quantity }}
      </el-form-item>

    </el-form>
    
    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="submitGoods">确 定</el-button>
        <el-button @click="cancelGoods">取 消</el-button>
      </div>
    </template>
  </el-dialog>

  <!--修改-->
  <el-dialog title="修改进货单" :inline="true" v-model="updateOpen" destroy-on-close @close="closeUpdateDlg" width="700px" append-to-body>
    <purchaseOrderEdit :purchaseOrder="purchaseOrder" />
  </el-dialog>


</template>

<script setup>

import { listPurchaseOrder, getPurchaseOrder, delPurchaseOrder, addPurchaseOrder, updatePurchaseOrder } from "@/api/purchase/purchaseOrder";
import purchaseOrderEdit from "./purchaseOrderEdit.vue";
import { eventBus } from "@/utils/eventBus";
import { reactive } from "vue";

const { proxy } = getCurrentInstance();
const { purchase_arrival_status } = proxy.useDict("purchase_arrival_status");
const goodsForm = ref({});
const addGoodsOpen = ref(false);
const updateOpen = ref(false);
const fileUrlList = ref([]);


// 接收 props
const props = defineProps({
  purchaseOrder: {
    type: Object,
    required: true,
  },
});

var copyOrder = reactive({});
const associationData = reactive({
  associationId: props.purchaseOrder.id,
  associationType: "PO",
});
// console.log("copyOrder ", copyOrder);
// console.log("props.purchaseOrder ", props.purchaseOrder);

// copyOrder.goodsList = copyOrder.goodsList ? JSON.parse(copyOrder.goodsList) : [];
// console.log("copyOrder.goodsList ", copyOrder.goodsList instanceof Array);

assignNewObj(props.purchaseOrder);
function assignNewObj(newObj) {
  Object.assign(copyOrder, newObj);
  copyOrder.goodsList = copyOrder.goodsList ? JSON.parse(copyOrder.goodsList) : [];
  fileUrlList.value = copyOrder.uploadFiles ? copyOrder.uploadFiles.map(item => item.filePath) : [];
}

function handleGoodsAdd() {
  goodsForm.value = {
    name: '',
    unitPrice: '',
    quantity: '',
    totalPrice: ''
  };
  console.log("打开新增明细弹窗")
  addGoodsOpen.value = true;
}

/** 修改按钮操作 */
function handleUpdate() {
  updateOpen.value = true;
}

function closeUpdateDlg(){
  console.log("关闭修改弹窗")
  updateOpen.value = false;
}

function submitGoods() {
  if (!goodsForm.value.name || !goodsForm.value.unitPrice || !goodsForm.value.quantity) {
    return;
  }

  console.log("copyOrder.goodsList push", copyOrder.goodsList instanceof Array);
  copyOrder.goodsList.push({name:goodsForm.value.name, unitPrice:goodsForm.value.unitPrice, quantity:goodsForm.value.quantity});
  updatePurchaseOrder({'id':copyOrder.id, 'goodsList': JSON.stringify(copyOrder.goodsList)}).then(response => {
    proxy.$modal.msgSuccess("新增成功");
    addGoodsOpen.value = false;
    getById();
  });

}
function removeGoods(index) {
  copyOrder.goodsList.splice(index, 1);
  updatePurchaseOrder({'id':copyOrder.id, 'goodsList': JSON.stringify(copyOrder.goodsList)}).then(response => {
    proxy.$modal.msgSuccess("删除成功");
    addGoodsOpen.value = false;
    getById();
  });
}

function getById() {
  getPurchaseOrder(copyOrder.id).then(response => {
    // copyOrder = reactive({ ...response.data });
    // Object.assign(copyOrder, response.data);
    assignNewObj(response.data);
    
  });
}

function purchaseOrderupdated(){
  updateOpen.value = false;
  getById();
}

onMounted(() => {
  eventBus.on('PO:orderupdated', purchaseOrderupdated);
});

onUnmounted(() => {
  eventBus.on('PO:orderupdated', purchaseOrderupdated);
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

.box-card {
  border: 2px solid #637a71;
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>