import { Field, SmartContract, state, State, method, MerkleWitness, PublicKey, Signature, PrivateKey } from 'o1js';

/**
 * Basic Example
 * See https://docs.minaprotocol.com/zkapps for more info.
 *
 * The Add contract initializes the state variable 'num' to be a Field(1) value by default when deployed.
 * When the 'update' method is called, the Add contract adds Field(2) to its 'num' contract state.
 *
 * This file is safe to delete and replace with your own contract.
 */

class MerkleWitness4 extends MerkleWitness(4) {

}
export class Add extends SmartContract {

  @state(Field) nextIndex = State<Field>();

  @state(PublicKey) cpsoPublicKey = State<PublicKey>();

  @state(Field) root = State<Field>();

  init() {
    super.init();
  }

  // called when contract is deployed
  @method initState(cpsoPublicKey: PublicKey, initRoot: Field) {
    this.cpsoPublicKey.set(cpsoPublicKey);
    this.root.set(initRoot); // root of the merkle tree
    this.nextIndex.set(Field(0));
  }

  @method addDoctor(cpsoPrivateKey: PrivateKey, doctor: PublicKey, leafWitness: MerkleWitness4) {
    // Circuit Assertion
    const commitedPublicKey = this.cpsoPublicKey.get();
    this.cpsoPublicKey.assertEquals(commitedPublicKey);

    // Check public key is only excuting it -  by verifying the signature using private key
    commitedPublicKey.assertEquals(cpsoPrivateKey.toPublicKey());

    // Check witness
    const initialRoot = this.root.get();
    this.root.assertEquals(initialRoot);

    this.nextIndex.assertEquals(leafWitness.calculateIndex());

    // creating new root
    const newRoot = leafWitness.calculateRoot(doctor.x);
    this.root.set(newRoot);

    // set new index
    const currIndex = this.nextIndex.get();
    this.nextIndex.assertEquals(currIndex);
    this.nextIndex.set(currIndex.add(Field(1)));

    // const index = this.nextIndex.get();
    // const newRoot = this.root.get().update(index, doctor);
    // this.root.set(newRoot);
    // this.nextIndex.set(index + Field(1));
  }

  @method verifySickNote(doctorWitness: MerkleWitness4, doctorPubKey: PublicKey, signature: Signature, patientPubKey: PublicKey) {

    this.root.assertEquals(doctorWitness.calculateRoot(doctorPubKey.x));

    const ok = signature.verify(doctorPubKey, patientPubKey.toFields());
    ok.assertTrue();


    // const root = this.root.get();
    // const index = doctorWitness.calculateIndex();
    // const newRoot = doctorWitness.calculateRoot(patient.x);
    // root.assertEquals(newRoot);
    // const leaf = doctorWitness.getLeaf();
    // leaf.assertEquals(sickNote);
  }

}
