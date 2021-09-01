import { Controller, DefaultWorker, textResult, viewResult, Worker, Assign, jsonResult, Route } from "fortjs";
import { trackList } from "../constants";

export class DefaultController extends Controller {

    @DefaultWorker()
    async index(@Assign('FortJs') title: string) {
        const data = {
            title: title
        };
        return jsonResult(trackList);
        // const result = await viewResult('default/index.html', data);
        // return result;
    }

    @Worker()
    async track() {
        const payload = {
            txHash: this.body.txHash,
            nonce: this.body.nonce,
            from: this.body.from
        }

        trackList.push(payload);
        return textResult('added');
    }

    @Worker()
    @Route('/set/{block}')
    async setBlock(){
        const block = this.param.block;
        
    }
}