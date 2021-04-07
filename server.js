const PROTO_PATH = "./lanche.proto";

const grpc = require('grpc');

const protoLoader = require('@grpc/proto-loader');

const packageDefinition = protoLoader.loadSync(
    PROTO_PATH,
    {keepCase: true,
     longs: String,
     enums: String,
     defaults: true,
     oneofs: true
    });
    
const protoDescriptor = grpc.loadPackageDefinition(packageDefinition).lanche;

const servicoLanche = protoDescriptor.ServicoLanche;
const servicoPedido = protoDescriptor.ServicoPedido;

const server = new grpc.Server();

const lanches = [
  {
    id: 0,
    nome: "Hamburguer",
    preco: 19.99
  }
];

const pedidos = [];

function listarCardapio(call, callback) {
  console.log(lanches);

  callback(null, {lanches: lanches});
}

function cadastrarLanche(call, callback) {
  const lanche = call.request.lanche;

  const ids = lanches.map((lanche) => {
    return lanche.id;
  });

  if (ids.length > 0){
    let max = 0;
    ids.map((id) => {
      if (id > max){
        max=id;
      }
    });
    lanches.push({...lanche, id: max + 1});
  } else{
    lanches.push({...lanche, id: 0});
  }

  callback(null, {});
}

function excluirLanche(call, callback) {
  const id = call.request.id;

  console.log(id);

  const temp = lanches.find((lanche) => lanche.id == id);

  if (temp !== undefined){
    lanches.splice(lanches.indexOf(temp),1);
  } else{
    console.log("Id não encontrada");
  }

  callback(null, {});
}

function montarPedido(call, callback) {
  const ids = call.request.ids;

  const lanchesPedido = lanches.filter((lanche) => ids.indexOf(lanche.id)>-1);

  if (lanchesPedido.length == ids.length){
    const pedidosIds = pedidos.map((pedido) => {
      return pedido.id;
    });
  
    if (pedidosIds.length > 0){
      let max = 0;
      pedidosIds.map((id) => {
        if (id > max){
          max=id;
        }
      });
      pedidos.push({id: max + 1, lanches: lanchesPedido, status: ""});
    } else{
      pedidos.push({id: 0, lanches: lanchesPedido, status: ""});
    }

    console.log("Pedido cadastrado");
  }else {
    console.log("Um ou mais lanche(s) não encontrado(s)");
  }

  callback(null, {});
}

function consultarPedidos(call, callback) {
  console.log(pedidos);

  callback(null, {pedidos: pedidos});
}

function solicitarEntrega(call, callback) {
  const id = call.request.id;

  const temp = pedidos.find((pedido) => pedido.id == id);
  if (temp !== undefined){
    pedidos.splice(pedidos.indexOf(temp),1);
    pedidos.push({...temp, status: "Sair para entrega"});
    console.log("Entrega solicitada");
  } else{
    console.log("Pedido não encontrado");
  }

  callback(null, {});
}

server.addService(servicoLanche.service,
                        {
                          ListarCardapio: listarCardapio,
                          CadastrarLanche: cadastrarLanche,
                          ExcluirLanche: excluirLanche
                        });

server.addService(servicoPedido.service,
                        {
                          MontarPedido: montarPedido,
                          ConsultarPedidos: consultarPedidos,
                          SolicitarEntrega: solicitarEntrega
                        });

server.bind("0.0.0.0:50051", grpc.ServerCredentials.createInsecure());

server.start();