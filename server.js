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
    id: 1,
    nome: "Hamburguer",
    preco: 19.99
  }
];

let pedidos = [];

function listarCardapio(call, callback) {
  callback(null, {lanches: lanches});
}

function cadastrarLanche(call, callback) {
  const lanche = call.request.lanche;

  const lastId = lanches.length > 0 ? lanches[lanches.length - 1].id : 0;

  lanches.push({...lanche, id: lastId + 1});

  callback(null, {});
}

function excluirLanche(call, callback) {
  const id = call.request.id;

  lanches.find((lanche, index) => {
    if(lanche.id === id){
      lanches.splice(index,1);
    }
  })

  callback(null, {});
}

function montarPedido(call, callback) {
  const ids = call.request.ids;

  const lanchesPedido = lanches.map((lanche) => {
    if(ids.indexOf(lanche.id)>-1){
      return lanche;
    }
  })

  const lastId = pedidos.length > 0 ? pedidos[pedidos.length - 1].id : 0

  pedidos.push({id: lastId + 1, lanches: lanchesPedido, status: ""});

  callback(null, {});
}

function consultarPedidos(call, callback) {
  callback(null, {pedidos: pedidos});
}

function solicitarEntrega(call, callback) {
  const id = call.request.id;

  const temp = pedidos.map((pedido) => {
    if(pedido.id === id){
      return {...pedido, status: "sair para entrega"};
    } else{
      return pedido;
    }
  });

  pedidos = temp;

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
                          ConsultarPedido: consultarPedidos,
                          SolicitarEntrega: solicitarEntrega
                        });

server.bind("0.0.0.0:50051", grpc.ServerCredentials.createInsecure());

server.start();