
import { AstNode } from "langium";
import { Hover } from "vscode-languageclient";
import { isEntity } from "./generated/ast.js";
import { AstNodeHoverProvider } from "langium/lsp";

export class MasalaHoverProvider extends AstNodeHoverProvider {
    protected getAstNodeHoverContent(node: AstNode): Hover | undefined {
        if (isEntity(node)) {
            return {
                contents: {
                    kind: 'markdown',
                    language: 'masala',
                    value: `class ${node.name} from hover`
                }
            }
        } 
        return undefined;
    }
}