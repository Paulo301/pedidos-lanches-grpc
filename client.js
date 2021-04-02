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

var client = new protoDescriptor.ServicoLanche('localhost:50051',
                                      grpc.credentials.createInsecure());

var client2 = new protoDescriptor.ServicoPedido('localhost:50051',
                                      grpc.credentials.createInsecure());

client.ListarCardapio({}, function(err, response) {
  if (err != null) {
    console.log(" >>> Ocorreu um erro na consulta do cardapio!");
    console.log(err);
    return;
  }

  console.log(">>>>>>Cardapio");
  response.lanches.map((lanche) =>{
    console.log(lanche.nome+".........."+lanche.preco);
  })
});

// client.CadastrarLanche({lanche: {id: 0, nome: "cachorro-quente", preco: 9.99}}, function(err, response) {
//   if (err != null) {
//     console.log(" >>> Ocorreu um erro no cadastro de lanche!");
//     console.log(err);
//     return;
//   }

//   console.log("Cadastrado com sucesso");
// });

// client.ExcluirLanche({id: 0, nome: "cachorro-quente", preco: 9.99}, function(err, response) {
//   if (err != null) {
//     console.log(" >>> Ocorreu um erro na exclusão do lanche!");
//     console.log(err);
//     return;
//   }

//   console.log("Excluido com sucesso");
// });
