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

      <el-descriptions-item label="家具类型">
        {{ parseFrunitureCategory(copyOrder.frunitureCategory) }}
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

      <el-descriptions-item label="物流">
        <dict-tag :options="purchase_logistics" :value="copyOrder.logistics" />
      </el-descriptions-item>

      <el-descriptions-item label="物流费">
        {{ copyOrder.logisticsMoney }}
      </el-descriptions-item>


      <!-- <el-descriptions-item label="手机">
        {{ copyOrder.phone }}
      </el-descriptions-item>

      <el-descriptions-item label="微信">
        {{ copyOrder.weichat }}
      </el-descriptions-item> -->

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
    <div class="item-list">
      <el-button type="primary" @click="handleItemAdd" style="margin-bottom: 10px;">新增</el-button>
      <el-table :data="itemList" style="width: 100%">
        <el-table-column type="expand">
          <template #default="scope">
            <el-card class="box-card" style="background-color: #f0f0f0;">
              <ImageUpload :modelValue="scope.row.uploadFiles.map(item => item.filePath)"
                :associationData="{ associationId: scope.row.id, associationType: 'POI' }" />
            </el-card>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="名称">
        </el-table-column>
        <el-table-column prop="unitPrice" label="单价">
        </el-table-column>
        <el-table-column prop="quantity" label="数量">
        </el-table-column>
        <el-table-column label="家具类别" align="center" prop="type">
          <template #default="scope">
            <span>{{ parseFrunitureCategory(scope.row.type) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="totalPrice" label="总价">
          <template #default="scope">
            {{ scope.row.unitPrice * scope.row.quantity }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button size="mini" type="danger" @click="handleUpdateItem(scope.row)">修改</el-button>
            <el-button size="mini" type="danger" @click="removeItem(scope.row)">删除</el-button>
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

  <el-dialog title="新增明细" v-model="addItemOpen" width="400">
    <el-form ref="itemFormRef" :model="itemForm" label-width="80px">
      <el-form-item label="名称" prop="name">
        <el-input v-model="itemForm.name" placeholder="请输入名称" />
      </el-form-item>
      <el-form-item label="单价" prop="unitPrice">
        <el-input-number v-model="itemForm.unitPrice" :min="1" placeholder="请输入单价" />
      </el-form-item>
      <el-form-item label="数量" prop="quantity">
        <el-input-number v-model="itemForm.quantity" :min="1" placeholder="请输入数量" />
      </el-form-item>
      <el-form-item label="家具类别" prop="type">
        <el-select v-model="itemForm.type" placeholder="请选择家具类别" style="width: 100px" clearable>
          <el-option v-for="dict in fruniture_category" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="总价">
        {{ itemForm.unitPrice * itemForm.quantity }}
      </el-form-item>

    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="submitItem">确 定</el-button>
        <el-button @click="cancelItem">取 消</el-button>
      </div>
    </template>
  </el-dialog>

  <!--修改-->
  <el-dialog title="修改进货单" :inline="true" v-model="updateOpen" destroy-on-close @close="closeUpdateDlg" width="700px"
    append-to-body>
    <purchaseOrderEdit :purchaseOrder="purchaseOrder" />
  </el-dialog>


</template>

<script setup>

import { getPurchaseOrder, updatePurchaseOrder } from "@/api/purchase/purchaseOrder";
import { listPurchaseOrderItem, addPurchaseOrderItem, updatePurchaseOrderItem, delPurchaseOrderItem }
  from "@/api/purchase/purchaseOrderItem";

import purchaseOrderEdit from "./purchaseOrderEdit.vue";
import { eventBus } from "@/utils/eventBus";
import { reactive } from "vue";

const { proxy } = getCurrentInstance();
const { purchase_arrival_status } = proxy.useDict("purchase_arrival_status");
const { fruniture_category } = proxy.useDict('fruniture_category');
const { purchase_logistics } = proxy.useDict('purchase_logistics');
const itemForm = ref({});
const addItemOpen = ref(false);
const updateOpen = ref(false);
const fileUrlList = ref([]);
const itemList = ref([]);


// 接收 props
const props = defineProps({
  purchaseOrder: {
    type: Object,
    required: true,
  },
});

const associationData = reactive({
  associationId: props.purchaseOrder.id,
  associationType: "PO",
});



watch(() => props.purchaseOrder, () => {
  assignNewObj(props.purchaseOrder);
  associationData.associationId = props.purchaseOrder.id;
  getItemList();
});

var copyOrder = reactive({});

// 自定义的 assign 函数，忽略指定属性
function customAssign(target, source, ignoreKeys) {

  if (!ignoreKeys) {
    Object.assign(target, source);
    return;
  }
  Object.keys(source).forEach(key => {
    if (!ignoreKeys.includes(key)) {
      target[key] = source[key];
    }
  });
}

assignNewObj(props.purchaseOrder);
function assignNewObj(newObj, ignoreKeys) {
  customAssign(copyOrder, newObj, ignoreKeys); // 根据实际情况替换 ignoreKey1, ignoreKey2
  fileUrlList.value = copyOrder.uploadFiles ? copyOrder.uploadFiles.map(item => item.filePath) : [];
}

getItemList();
function getItemList() {
  listPurchaseOrderItem({ purchaseOrderId: copyOrder.id }).then(response => {
    itemList.value = response.rows;
  });
}

function handleItemAdd() {
  itemForm.value = {
    name: '',
    unitPrice: '',
    quantity: '',
    totalPrice: '',
    type: '',
    purchaseOrderId: copyOrder.id
  };
  addItemOpen.value = true;
}

/** 修改按钮操作 */
function handleUpdate() {
  updateOpen.value = true;
}

function closeUpdateDlg() {
  updateOpen.value = false;
}

function submitItem() {
  if (!itemForm.value.name || !itemForm.value.unitPrice || !itemForm.value.quantity) {
    return;
  }

  itemForm.value.purchaseOrderId = copyOrder.id;
  if (itemForm.value.id) {
    updatePurchaseOrderItem(itemForm.value).then(response => {
      proxy.$modal.msgSuccess("修改成功");
      addItemOpen.value = false;
      getById();
      getItemList();
    });
  } else {
    addPurchaseOrderItem(itemForm.value).then(response => {
      proxy.$modal.msgSuccess("新增成功");
      addItemOpen.value = false;
      getById();
      getItemList();
    });
  }


}

function handleUpdateItem(row) {
  addItemOpen.value = true;

  //itemForm.value = row; //这是浅拷贝，会改变原数据
  itemForm.value = JSON.parse(JSON.stringify(row));//这是深拷贝，不影响原数据
  itemForm.value.purchaseOrderId = copyOrder.id;
}
function removeItem(row) {
  delPurchaseOrderItem(row).then(response => {
    proxy.$modal.msgSuccess("删除成功");
    addItemOpen.value = false;
    getById();
    getItemList();
  });
}

function getById() {
  getPurchaseOrder(copyOrder.id).then(response => {

    //说明：getPurchaseOrder这个接口查询的只有进货单的基本信息，没有图片信息，
    //也就是说response.data中的uploadFiles是空的。所以这里
    //使用assignNewObj方法，将response.data赋值给copyOrder时，要忽略掉uploadFiles属性
    assignNewObj(response.data, ['uploadFiles']);

  });
}


function purchaseOrderupdated() {
  updateOpen.value = false;
  getById();
}

function parseFrunitureCategory(frunitureCategorys) {
  if (!frunitureCategorys || frunitureCategorys.length === 0) {
    return '';
  }

  // 将 frunitureCategorys 字符串按逗号分割成数组
  const categoryIds = frunitureCategorys.split(',');

  // 使用 fruniture_category.value 数组查找对应的 label
  const categoryNames = categoryIds.map(id => {
    const category = fruniture_category.value.find(cat => cat.value === id);
    return category ? category.label : '';
  });

  // 将类别名称数组用逗号连接成字符串
  return categoryNames.join(',');
}

onMounted(() => {
  eventBus.on('PO:orderUpdated', purchaseOrderupdated);
});

onUnmounted(() => {
  eventBus.on('PO:orderUpdated', purchaseOrderupdated);
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