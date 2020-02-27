/*
# Copyright IBM Corp. All Rights Reserved.
#
# SPDX-License-Identifier: Apache-2.0
*/

const shim = require('fabric-shim');
const util = require('util');

var Chaincode = class {

  // Initialize the chaincode
  async Init(stub) {
    console.info('++++++++++++++AuOmniDocMgmt++++++++++++');   
stub.putState("count", Buffer.from("0"));
    return shim.success();
  }

  async Invoke(stub) {
    let ret = stub.getFunctionAndParameters();
    console.info(ret);
    let method = this[ret.fcn];
    if (!method) {
      console.error('no method of name:' + ret.fcn + ' found');
      return shim.error('Contract (V1) no method of name :' + ret.fcn + ' found');
    }

    console.info('\nCalling method : ' + ret.fcn);
    try {
      let payload = await method(stub, ret.params);
      return shim.success(payload);
    } catch (err) {
      console.log(err);
      return shim.error(err);
    }
  }

  async addDocument(stub, args) {
   /* if (args.length != 5) {
      throw new Error('Incorrect number of arguments. Expecting 3');
    }*/

    let index = await stub.getState("count");;
   var docMgmt = {      
      fixId: args[0],
      version: args[1],
      aucId: args[2],
      recordId: args[3],
      dStatus: args[4],
      invConf: args[5],
      ownConf: args[6],
      uId: args[7],
      tId: args[8],
      fixhash: args[9],
      ipfsHash: args[10]      
	    
    };	
      
    // Write the states back to the ledger
    await stub.putState(index.toString(), Buffer.from(JSON.stringify(docMgmt)));
    
   
    let countInt = parseInt(index.toString()) + 1;
    await stub.putState("count", Buffer.from(countInt.toString()));

  }

  async getCount(stub, args) {
	let count = await stub.getState("count");
	return count;
  }
 
  // query callback representing the query of a chaincode
  async getDocumentByIndex(stub, args) {
    if (args.length != 1) {
      throw new Error('Incorrect number of arguments. Expecting the card token to query')
    }
    
    let index = args[0];

    // Get the state from the ledger
    let docBytes = await stub.getState(index); 
	
    return docBytes;
  }
	
  async updateDocument(stub, args) {
    console.info('============= START : debit ===========');
    if (args.length != 2) {
      throw new Error('Incorrect number of arguments. Expecting 2');
    }

    let getDocDataAsBytes = await stub.getState(args[0]);
   var docMgmt = {      
      fixId: args[1],
      version: args[2],
      aucId: args[3],
 	recordId: args[4],
      dStatus: args[5],
      invConf: args[6],
	ownConf: args[7],
      uId: args[8],
      tId: args[9],
	fixhash: args[10],
      ipfsHash: args[11]
      
	    
    };	

    await stub.putState(args[0], Buffer.from(JSON.stringify(docMgmt)));
    console.info('============= END : debit ===========');
  }


};

shim.start(new Chaincode());
