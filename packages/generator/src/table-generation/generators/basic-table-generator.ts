import ts, { factory } from "typescript"
import { tagFormattedMessage, tagFormattedProperty } from '../typeAlias'
import { createJsxElement, TableComponent, createFunctionalComponent } from '../react-components/react-component-helper'
import { Entity, Property } from '../entity/index'
import { TableGenerator } from './table-generator-factory'
import { TableComponentDefinition, TableComponentDefinitionBase } from '../../table-definition/table-definition-core'
import { MuiTableComponents } from '../../table-definition/material-ui/table'
import TableGeneratorBase from './table-generator-base'
import GenerationContext from "../context"

export class BasicTableGenerator extends TableGeneratorBase  implements TableGenerator
{
    constructor(generationContext: GenerationContext) {
        super(generationContext);
    }

    generateTableComponent(): TableComponent {
        const tableComponent = this.prepareComponent(this.getTableDefinition().table)
        const rowComponent = this.prepareComponent(this.getTableDefinition().row)
        
        let element = createJsxElement(tableComponent.tagName, [],
            [
                createJsxElement(rowComponent.tagName, [],
                    this.getProperties()
                        .map((prop) => this.propertyHead(prop, this._context.entity))
                ),
                this.mapArrayToTableRows(
                    createJsxElement(rowComponent.tagName, [],
                        this.getProperties()
                            ?.map(prop => this.propertyCell(prop, this._context.entity, this.getRowIdentifier()))
                    ),
                    this.getRowsIdentifier(), this.getRowIdentifier()
                )
            ]
        )

        return {imports: this.uniqueImports(), functionDeclaration: this.entityTablePage(element)};
    }

    getTableDefinition() : TableComponentDefinition {
        return MuiTableComponents;
    }

    private entityTablePage(table: ts.JsxElement) {
        var returnStatement = factory.createReturnStatement(table);

        const params = [factory.createParameterDeclaration(
            undefined,
            undefined,
            undefined,
            factory.createObjectBindingPattern([factory.createBindingElement(
              undefined,
              undefined,
              this.getRowsIdentifier(),
              undefined
            )]),
            undefined,
            undefined,
            undefined
          )]
    
        return createFunctionalComponent('Table', params, [returnStatement])
    }

    private propertyHead(prop: Property, entity: Entity) {
        return createJsxElement(this.prepareComponent(this.getTableDefinition().cell).tagName, [],
            tagFormattedMessage(prop, entity)
        )
    }
    
    private propertyCell(prop: Property, entity: Entity, row = factory.createIdentifier("row")) {
        return createJsxElement(this.prepareComponent(this.getTableDefinition().cell).tagName, [], [
            factory.createJsxText(
                prop.getName(),
                false
            ),
            ...tagFormattedProperty(prop, row)
        ])
    }
    
    private mapArrayToTableRows(body: ts.ConciseBody, rows: ts.Expression = factory.createIdentifier("rows"), row: ts.Identifier = factory.createIdentifier("row")) {
        return factory.createJsxExpression(undefined,
            factory.createCallExpression(
                factory.createPropertyAccessExpression(
                    rows,
                    factory.createIdentifier("map")
                ),
                undefined,
                [factory.createArrowFunction(
                    undefined,
                    undefined,
                    [factory.createParameterDeclaration(
                        undefined,
                        undefined,
                        undefined,
                        row,
                        undefined,
                        undefined,
                        undefined
                    )],
                    undefined,
                    factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                    body
                )]
            )
        )
    }
}


